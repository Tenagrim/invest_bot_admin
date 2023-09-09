import './App.css';
import ChapterForm from "./components/ChapterForm";
import {Button, Col, Container, Row, Card, ButtonGroup} from "react-bootstrap";
import * as React from "react";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';


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

    return (
        <Container>
            <Row>
                <Col className='col-2 float-end'>
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
            </Row>
        </Container>
    );
}

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            chapters: [],
            botConfig: {}
        }
        this.addChapter = this.addChapter.bind(this)
        this.addVersion = this.addVersion.bind(this)
        this.setVersion = this.setVersion.bind(this)
        this.setChapter = this.setChapter.bind(this)
    }

    mapChapters(chapters){
        let result =  chapters
            .sort((a,b)=>a.itemId - b.itemId)
            .map((c,i)=>({...c,uid:i}))
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
                this.setState({chapters: this.mapChapters(data)});
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
            newChapter: true,
            dataVersionId: this.state.botConfig.currentVersion.id,
            chapterTypeId: 1, // TODO
            itemId: null,
            uid:  this.state.chapters.length + 1
        }
        let chapters = [...this.state.chapters]
        chapters.push(newChapter)
        // console.log(chapters)
        this.setState({chapters: chapters})
    }

    setChapter(chapter){
        let chapters = [...this.state.chapters];
        let index = chapters.findIndex(x => x.uid === chapter.uid);
        chapters[index] = chapter
        this.setState({chapters:chapters});
    }

    render() {
        console.log("APP RENDER =====================")
        console.log(this.state.chapters)
        let chapters = this.state.chapters.map((c, i) =>
            <Col className='px-0 col-4'>
                <ChapterForm key={i} chapter={c} chapters={this.state.chapters} setChapter={this.setChapter}/>
            </Col>
        )

        return (
            <Container className="p-3">
                <AppHeader botConfig={this.state.botConfig} setVersion={this.setVersion} addVersion={this.addVersion}/>
                <Container className='bg-light'>
                    <Row>
                        {chapters}
                        <Col className='px-0 col-4'>
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
