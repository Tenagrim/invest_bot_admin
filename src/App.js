import './App.css';
import ChapterForm from "./components/ChapterForm";
import {Button, Col, Container, Row, Card, ButtonGroup} from "react-bootstrap";
import * as React from "react";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import MasksSelector from "./components/MarksSelector";
import {useState} from "react";


const API_URL = 'http://localhost:5000';
const BOT_SYSNAME = "INVEST_BOT";

const AppHeader = (props) => {
    const botConfig =props.botConfig;

    let versions = []

    let note = ''

    if (!!botConfig.currentVersion) {
        note = botConfig.currentVersion.note;
    }
    if (!!botConfig.botConfigVersion) {
        console.log('bot config:');
        console.log(botConfig);
        versions = botConfig.botConfigVersion.dataVersions.sort((a,b)=>a.id-b.id).map(v =>
            <Dropdown.Item eventKey={v.id} active={v.id === botConfig.currentVersion.id}>
                {v.note}
            </Dropdown.Item>
        );
    }

    // const setMark = (markId)=>{
    //     let newKey = (1<<markId) | marksKey;
    //     setMarksKey(newKey);
    // }
    // const unsetMark = (markId)=>{
    //     // let newKey = (~(1<<markId)) & marksKey;
    //     // setMarksKey(newKey);
    // }


    return (
        <Container>
            <Row>
                <Col className='col-auto float-end'>
                    <DropdownButton
                        onSelect={event=>{
                            if(event === 'new')
                                props.addVersion()
                            else
                                props.setVersion(event)
                        }}
                        as={ButtonGroup}
                        key='Primary'
                        id={`dropdown-variants-primary`}
                        variant='primary'
                        title={note}>
                        {versions}
                        <Dropdown.Divider />

                        <Dropdown.Item eventKey='new'>
                            Добавить версию
                        </Dropdown.Item>
                    </DropdownButton>
                </Col>
                <Col className='col-auto'>
                    <MasksSelector
                        marksList={props.marksList}
                        marksKey={props.marksKey}
                        setMark={props.setMark}
                        unSetMark={props.unsetMark}
                        style={{fontSize: 1}}
                    />
                </Col>
            </Row>
        </Container>
    );
}

class App extends React.Component {

    constructor(props) {
        super(props);
        let chapters=[]

        this.state = {
            chapters: [],
            botConfig: {chapterMarks:[]},
            filterMarksKey: 0,
            filterMarks: [
                {id:0, key:1, name:'Метка 1'},
                {id:0, key:2, name:'Метка 2'},
                {id:0, key:3, name:'Метка 3'},
                {id:0, key:4, name:'Метка 4'},
                {id:0, key:5, name:'Метка 5'},
                {id:0, key:6, name:'Метка 6'},
                {id:0, key:7, name:'Метка 7'},
                {id:0, key:8, name:'Метка 8'}
            ]
        }
        this.addChapter = this.addChapter.bind(this)
        this.addVersion = this.addVersion.bind(this)
        this.setVersion = this.setVersion.bind(this)
        this.setChapter = this.setChapter.bind(this)
        this.setFilterMark = this.setFilterMark.bind(this)
        this.unsetFilterMark = this.unsetFilterMark.bind(this)
    }


    setFilterMark (markKey){
        let newKey = (1<<markKey) | this.state.filterMarksKey;
        this.filterChapters(newKey);
        this.setState({filterMarksKey:newKey})
    }
    unsetFilterMark (markKey){
        let newKey = (~(1<<markKey)) & this.state.filterMarksKey;
        this.filterChapters(newKey);
        this.setState({filterMarksKey:newKey})
    }

    filterChapters(key){
        if (key !== 0){
           let newChapters = this.chapters.filter(ch=>ch.marksKey & key);
           this.setState({chapters:newChapters})
        }
        else{
            this.setState({chapters:this.chapters})
        }
    }

    mapChapters(chapters){
        let result =  chapters
            .sort((a,b)=>a.itemId - b.itemId)
            .map((c,i)=>({...c, uid:i, changed:false})) // TODO
        console.log('SORTED_CHAPTERS ====================')
        console.log(result);
        return result;
    }

    addVersion(){
        fetch(API_URL + '/config/createVersionFromCurrent',{
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({sysName: BOT_SYSNAME})
        }).then(response => {
            return response.json()
        }).then(botConf=>{
            this.setState({botConfig: botConf})
            this.updateChapters(botConf);
        })
    }

    setVersion(targetVersionId){
        fetch(API_URL + '/config/setCurrentVersion',{
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({sysName: BOT_SYSNAME, targetVersionId: targetVersionId})
        }).then(response => {
            return response.json()
        }).then(botConf => {
            fetch(API_URL + '/chapters/' + botConf.currentVersion.id)
                .then(response => {
                    return response.json()
                })
                .then(chs => {
                    let newState = {botConfig: botConf, chapters: this.mapChapters(chs)}
                    this.setState(newState, ()=>{
                        console.log('SET STATE ========================');
                        console.log(newState);
                        // this.forceUpdate()
                    });
                })
        })
    }

    updateChapters(config){
        fetch(API_URL + '/chapters/' + config.currentVersion.id)
            .then(response => {
                return response.json()
            })
            .then(data => {
                let chs = this.mapChapters(data)
                this.chapters = chs;
                this.setState({chapters: chs});
            })
    }

    componentDidMount() {
        fetch(API_URL + '/config/getBySysName', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({sysName: BOT_SYSNAME})
        }).then(response => {
            return response.json()
        })
        .then(data => {
            this.setState({botConfig: data});
            // console.log('---------------------')
            // console.log(this.state.botConfig);
            // console.log(data);
            this.updateChapters(data);
        })
    }

    addChapter() {
        // console.log(this.state.botConfig);
        let newChapter = {
            id: null,
            text: 'Новый раздел',
            note: 'Новый раздел',
            chapterButtons: [],
            chapterAttachements:[],
            changed: true,
            dataVersionId: this.state.botConfig.currentVersion.id,
            chapterTypeId: 1, // TODO
            marksKey: 0,
            itemId: null,
            uid:  this.chapters.length + 1
        }
        let chapters = [...this.chapters]
        chapters.push(newChapter)
        this.chapters.push(newChapter)
        // console.log(chapters)
        this.setState({chapters: chapters})
    }

    setChapter(chapter){
        // let chapters = [...this.chapters];
        let index = this.chapters.findIndex(x => x.uid === chapter.uid);
        this.chapters[index] = chapter
        this.filterChapters(this.state.filterMarksKey)

        // this.setState({chapters:chapters});
    }

    render() {
        console.log("APP RENDER =====================")
        console.log(this.chapters)
        let chapters = this.state.chapters.map((c, i) =>
            <Col className='px-0 col-12 col-sm-12 col-md-6 col-lg-6 col-xl-4 col-xxl-4 '>
                <ChapterForm key={i}
                             chapter={c}
                             chapters={this.chapters}
                             setChapter={this.setChapter}
                             marksList={this.state.botConfig.chapterMarks}
                />
            </Col>
        )

        return (
            <Container className="p-3">
                <AppHeader
                    botConfig={this.state.botConfig}
                    setVersion={this.setVersion}
                    addVersion={this.addVersion}
                    marksList={this.state.botConfig.chapterMarks}
                    marksKey={this.state.filterMarksKey}
                    setMark={this.setFilterMark}
                    unsetMark={this.unsetFilterMark}
                />
                <Container className='bg-light'>
                    <Row>
                        {chapters}
                        {/*{addButton}*/}
                        <Col className='px-0 col-lg-3 col-sm-12' hidden={this.state.filterMarksKey!==0}>
                            <Container className='bg-light rounded-3 m-1 p-2 h-100'>
                                <Card className={'h-100'}>
                                    <Button className='btn-light m-3 h-100' onClick={this.addChapter}> Добавить раздел</Button>
                                </Card>
                            </Container>
                        </Col>
                    </Row>
                </Container>
            </Container>
        )
    }
}

export default App;
