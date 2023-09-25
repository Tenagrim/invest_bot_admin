import {useEffect, useState} from "react";
import {
    Button,
    ButtonGroup,
    Card,
    Col,
    Container,
    Dropdown,
    Form,
    Row
} from "react-bootstrap";
import * as PropTypes from "prop-types";
import MasksSelector from "./MarksSelector";
import * as React from "react";
import {API, API_URL} from "./AxiosInterceptor";
import EditableText from "./EditableText";
import ParagraphButton from "./ParagraphButton";
import ChapterParagraph from "./ChapterParagraph";

function MenuItem(props) {
    return null;
}

MenuItem.propTypes = {
    eventKey: PropTypes.string,
    children: PropTypes.node
};

export default function ChapterForm(props) {

    // console.log('Chapter:')
    // console.log(props.chapter)
    let chapter = props.chapter;
    let changed = props.chapter.changed;
    let chapterText = props.chapter.text;

    // const [changed, setChanged] = useState(props.chapter.newChapter);
    const setChanged = (c)=>{
        changed = c;
        chapter.changed = c;
        props.setChapter(chapter);
    }

    const setMark =(markId)=>{
        let newKey = (1<<markId) | chapter.marksKey;
        chapter.marksKey = newKey
        props.setChapter(chapter);
        setChanged(true)
    }

    const unsetMark =(markId)=>{
        let newKey = (~(1<<markId)) & chapter.marksKey;
        chapter.marksKey = newKey
        props.setChapter(chapter);
        setChanged(true)
    }

    const _setChapter = (ch) => {
        chapter = ch;
        props.setChapter(ch)
    };
    const _setChapterText = (t) => {
        chapterText = t;
        chapter.text = t;
        props.setChapter(chapter);
    };
    // const _setButtons = (btt) => {
    //     buttons = btt;
    //     chapter.buttons = btt;
    //     props.setChapter(chapter)
    // };

    const setChapter = (chapter) => {
        setChapterText(chapter.text);
        // setButtons(chapter.chapterButtons.map((b, i) => ({...b, uid: i})));
        setParagraphs(chapter.chapterParagraphs.map((b, i) => ({...b, uid: i+1})));
        _setChapter(chapter);
    }

    const setChapterText = (text) => {
        chapter.text = text
        // chapterText = text
        _setChapterText(text)
    }
    // const setButtons = (buttons) => {
    //     chapter.chapterButtons = buttons;
    //     _setButtons(buttons)
    //     setChanged(true)
    // }
    const setParagraphs = (paragraphs) =>{
        chapter.chapterParagraphs = paragraphs;
        console.log('PARAGRAPHS: ===============');
        console.log(paragraphs);
    }

    // const removeButton = (uid)=>{
    //     let btts = buttons.filter(b=>b.uid!==uid);
    //     btts.forEach((b,i)=>b.uid = i)
    //     console.log('REMOVED: =========================')
    //     console.log(btts)
    //     setButtons(btts)
    // }

    const setNoteText = (text) => {
        if (text !== chapterText) {
            chapter.note = text;
            chapter.changed = true;
            setChapter(chapter)
        }
        // setChanged(true)
    }

    const setParagraph=(paragraph)=>{
        let index = chapter.chapterParagraphs.findIndex(x => x.uid === paragraph.uid);
        let newParagraphs = [...chapter.chapterParagraphs];
        newParagraphs[index] = paragraph;
        setParagraphs(newParagraphs);
        setChanged(true);
    }
    const addParagraph=()=>{
        let paragraphs = chapter.chapterParagraphs;
        let maxPLacement = paragraphs.length > 0 ? Math.max(...paragraphs.map(o => o.placement)) : 0;
        let newParagraph={
            id:null,
            text:'Новый раздел',
            placement: maxPLacement + 1,
            paragraphButtons:[],
            uid: paragraphs.length + 1
        };
        chapter.chapterParagraphs.push(newParagraph);
        setChapter(chapter);
        setChanged(true);
    }

    const onSaveChapter = () => {
        console.log(chapter);
        API.post('/chapters/save-chapters',
            {chapters: [chapter]})
            .then(resp => {
                console.log(resp.data);
                setChapter({...resp.data[0], uid: chapter.uid, changed: false});
            })
    }
    const onLoadChapter = () => {
        if (!!chapter.id) {
            API.post('/chapters/get-chapter',
                {itemId: chapter.itemId, versionId: chapter.dataVersionId}
                ).then(resp => {
                    setChapter({...resp.data, uid: chapter.uid, changed: false});
                })
        }
    }
    const onDeleteChapter = () => { // TODO
    }



    const reorder = (uid, asc)=>{
        if(!!chapter.chapterParagraphs && chapter.chapterParagraphs.length > 1) {
            let par = chapter.chapterParagraphs.find(p => ((!!p.id && p.id === uid) || (!!p.uid && p.uid === uid)));
            let less = chapter.chapterParagraphs
                .filter(p=>asc?p.placement<par.placement:p.placement>par.placement);
            if (less.length>0) {
                let prevMin = less
                    .reduce((prev, p) => asc ? p.placement > prev.placement ? p : prev : p.placement < prev.placement ? p : prev);
                if (prevMin.placement !== par.placement) {
                    let t = prevMin.placement;
                    prevMin.placement = par.placement;
                    par.placement = t;
                    setChanged(true);
                }
            }
        }
    }

    const paragraphUp = (uid)=>{
        reorder(uid,false);
    }
    const paragraphDown = (uid)=>{
        reorder(uid,true);
    }
    const paragraphRemove = (uid)=>{
        console.log(uid)
        console.log(chapter.chapterParagraphs);
        let np = chapter.chapterParagraphs
            .filter(p=>((!!p.id && p.id !== uid) || (!!p.uid && p.uid !== uid)));
        console.log(np);
        props.chapter.chapterParagraphs = np;
        setChanged(true);
    }

    let paragraphsC = chapter.chapterParagraphs
        .sort((a,b)=>b.placement - a.placement)
        .map((cp, i) => {
            return (
                <ChapterParagraph
                    // key={cp.id == null ? !!cp.uid? cp.uid : i : cp.id}
                    key={!!cp.id?cp.id:cp.uid}
                    // key={cp.id}
                    paragraph={cp}
                    chapter={chapter}
                    chapters={props.chapters}
                    setParagraph={setParagraph}
                    change={()=>setChanged(true)}
                    moveUp={paragraphUp}
                    moveDown={paragraphDown}
                    remove={paragraphRemove}
                    hiddenMenu={chapter.chapterParagraphs.length === 1}
                    marksList={props.marksList}
                />
            );
        })

    return (
        <Container className='bg-light rounded-3 m-1 p-2 h-100'>
            <Card className={'h-100 ' + (changed ? 'bg-warning' : '')}>
                <Card.Header>
                    <Row className='row-cols-3 w-100 mx-0 justify-content-between'>
                        <Col className='col-auto p-0'>
                            <p className='m-0'
                               style={{fontSize: 15}}>{'[' + (chapter.itemId == null ? '_' : chapter.itemId) + ']'}</p>
                        </Col>
                        <Col className='col-8'>
                            <MasksSelector
                                marksList={props.marksList}
                                marksKey={chapter.marksKey}
                                setMark={setMark}
                                unSetMark={unsetMark}
                                fontSize={12}
                            />
                        </Col>
                        <Col className='col-2 align-self-end'>
                            <ButtonGroup>
                                <Button className='btn-light btn-outline-secondary my-0 p-0' style={{fontSize: 15}}
                                        onClick={onLoadChapter}>🔃</Button>
                                <Button className='btn-light btn-outline-secondary my-0 p-0' style={{fontSize: 15}}
                                        onClick={onSaveChapter}>💾</Button>
                                {/*<Button className='btn-light btn-outline-secondary my-0 p-0' style={{fontSize: 15}} onClick={onDeleteChapter}>❌</Button>*/}
                            </ButtonGroup>
                        </Col>
                    </Row>
                    <Row className=''>

                        <Col className=''>
                            <EditableText setClass={'fw-bold'} initialText={chapter.note} setText={setNoteText}/>
                        </Col>

                    </Row>

                </Card.Header>
                <Card.Body>
                    <Card>
                        {/*<Card.Body>*/}
                            <Button className='btn-light m-0 h-100' onClick={addParagraph}>Добавить</Button>
                        {/*</Card.Body>*/}
                    </Card>
                    {paragraphsC}
                </Card.Body>
            </Card>
        </Container>
    );
}