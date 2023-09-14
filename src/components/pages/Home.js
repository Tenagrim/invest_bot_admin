import '../../App.css';
import ChapterForm from "../ChapterForm";
import {Button, Col, Container, Row, Card, ButtonGroup, Form} from "react-bootstrap";
import * as React from "react";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import MasksSelector from "../MarksSelector";
import {API, API_URL} from "../AxiosInterceptor";
import {useNavigate} from "react-router-dom";


const BOT_SYSNAME = "INVEST_BOT";

const AppHeader = (props) => {
    const navigate = useNavigate();
    const botConfig =props.botConfig;

    let versions = []

    let note = ''

    if (!!botConfig&& !!botConfig.currentVersion) {
        note = botConfig.currentVersion.note;
    }
    if (!!botConfig&&!!botConfig.botConfigVersion) {
        console.log('bot config:');
        console.log(botConfig);
        versions = botConfig.botConfigVersion.dataVersions.sort((a,b)=>a.id-b.id).map(v =>
            <Dropdown.Item eventKey={v.id} active={v.id === botConfig.currentVersion.id}>
                {v.note}
            </Dropdown.Item>
        );
    }

    const onLogout =()=>{
        localStorage.removeItem("token");
        navigate('/login');
    }

    return (
        <Container>
            <Row className=''>
                <Col className='col-auto'>
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
                <Col className='col-3'>
                    <Form.Control onChange={e=>props.setFilterString(e.target.value)}></Form.Control>
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
                <Col className='col-1 float-end'>
                    <Button onClick={onLogout} className='btn-light btn-outline-secondary' >LogOut</Button>
                </Col>
            </Row>
        </Container>
    );
}

class Home extends React.Component {

    constructor(props) {
        super(props);
        this.chapters=[];
        this.token = '';
        this.state = {
            chapters: [],
            botConfig: {
                chapterMarks:[]},
            filterMarksKey: 0,
            filterString:''
        }
        this.addChapter = this.addChapter.bind(this)
        this.addVersion = this.addVersion.bind(this)
        this.setVersion = this.setVersion.bind(this)
        this.setChapter = this.setChapter.bind(this)
        this.setFilterMark = this.setFilterMark.bind(this)
        this.unsetFilterMark = this.unsetFilterMark.bind(this)
        this.setFilterString = this.setFilterString.bind(this)
    }


    setFilterString(str){
        this.filterChapters(this.state.filterMarksKey, str);
        this.setState({filterString:str})
    }

    setFilterMark (markKey){
        let newKey = (1<<markKey) | this.state.filterMarksKey;
        this.filterChapters(newKey,this.state.filterString);
        this.setState({filterMarksKey:newKey})
    }
    unsetFilterMark (markKey){
        let newKey = (~(1<<markKey)) & this.state.filterMarksKey;
        this.filterChapters(newKey, this.state.filterString);
        this.setState({filterMarksKey:newKey})
    }

    filterChapters(key, str){
        let newChapters = this.chapters
        if (key !== 0){
            newChapters = newChapters.filter(ch=> (ch.marksKey & key));
        }
        if (!!str && str !== ''){
            newChapters = newChapters.filter(ch=> (ch.note.toLowerCase().includes(str.toLowerCase())));
        }
        this.setState({chapters:newChapters})
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
        API.post('/config/createVersionFromCurrent',{
            sysName: BOT_SYSNAME
        }).then(resp=>{
            this.setState({botConfig: resp.data})
            this.updateChapters(resp.data);
        })
    }

    setVersion(targetVersionId){
        API.post('/config/setCurrentVersion',
            {sysName: BOT_SYSNAME, targetVersionId: targetVersionId},)
            .then(resp => {
                API.get('/chapters/' + resp.data.currentVersion.id)
                    .then(s_resp => {
                    let newState = {botConfig: resp.data, chapters: this.mapChapters(s_resp.data)}
                    this.setState(newState, ()=>{
                        console.log('SET STATE ========================');
                        console.log(newState);
                        // this.forceUpdate()
                    });
                })
        })
    }

    updateChapters(config){
        if (!!config.currentVersion) {
            API.get('/chapters/' + config.currentVersion.id,)
                .then(resp => {
                    let chs = this.mapChapters(resp.data)
                    this.chapters = chs;
                    this.setState({chapters: chs});
                })
        }
    }

    componentDidMount() {
        API.post('/config/getBySysName',{
            sysName: BOT_SYSNAME
        }).then(resp => {
            this.setState({botConfig: resp.data});
            this.updateChapters(resp.data);
        }).catch(()=>{
            console.error("something went wrong")
        })
    }

    addChapter() {
        // console.log(this.state.botConfig);
        if (!!this.state.botConfig.currentVersion) {
            let newChapter = {
                id: null,
                text: 'Новый раздел',
                note: 'Новый раздел',
                chapterButtons: [],
                chapterAttachements: [],
                changed: true,
                dataVersionId: this.state.botConfig.currentVersion.id,
                chapterTypeId: 1, // TODO
                marksKey: 0,
                itemId: null,
                uid: this.chapters.length + 1
            }
            let chapters = [...this.chapters]
            chapters.push(newChapter)
            this.chapters.push(newChapter)
            // console.log(chapters)
            this.setState({chapters: chapters})
        }
    }

    setChapter(chapter){
        // let chapters = [...this.chapters];
        let index = this.chapters.findIndex(x => x.uid === chapter.uid);
        this.chapters[index] = chapter
        this.filterChapters(this.state.filterMarksKey, this.state.filterString)

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
                             marksList={!!this.state.botConfig? this.state.botConfig.chapterMarks:[]}
                />
            </Col>
        )

        return (
            <Container className="p-3">
                <AppHeader
                    botConfig={this.state.botConfig}
                    setVersion={this.setVersion}
                    addVersion={this.addVersion}
                    marksList={!!this.state.botConfig? this.state.botConfig.chapterMarks:[]}
                    marksKey={this.state.filterMarksKey}
                    setMark={this.setFilterMark}
                    unsetMark={this.unsetFilterMark}
                    setFilterString={this.setFilterString}
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

export default Home;
