import {useEffect, useState} from "react";
import {
    Button,
    ButtonGroup,
    Card,
    Col,
    Container,
    Dropdown,
    Form,
    Row,
    SplitButton,
    ToggleButton
} from "react-bootstrap";
import * as PropTypes from "prop-types";
import CardHeader from "react-bootstrap/CardHeader";

const CHAPTERS_URL = 'http://localhost:5000/chapters';
const API_URL = 'http://localhost:5000';

function MenuItem(props) {
    return null;
}

MenuItem.propTypes = {
    eventKey: PropTypes.string,
    children: PropTypes.node
};

const EditableText = (props) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(props.initialText);

    const handleDoubleClick = () => {
        setIsEditing(true);
    };

    const handleChange = (event) => {
        setText(event.target.value);
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (text !== props.initialText)
            props.setText(text)
        // Save the changes or perform any required actions here
    };
    const _handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleBlur()
        }
    }

    return (
        <div onClick={handleDoubleClick} className={props.setClass}>
            {isEditing ? (
                <input className='w-100 text-center'
                       type="text"
                       value={text}
                       onChange={handleChange}
                       onBlur={handleBlur}
                       onKeyDown={_handleKeyDown}
                />
            ) : (
                <span>{text}</span>
            )}
        </div>
    );
};

export default function ChapterForm(props) {

    // console.log('Chapter:')
    // console.log(props.chapter)
    let chapter = props.chapter;
    let chapterText = props.chapter.text;
    let buttons = props.chapter.chapterButtons.map((b, i) => ({...b, uid: i}));

    const _setChapter = (ch) => {
        chapter = ch;
        props.setChapter(ch)
    };
    const _setChapterText = (t) => {
        chapterText = t;
        chapter.text = t;
        props.setChapter(chapter);
    };
    const _setButtons = (btt) => {
        buttons = btt;
        chapter.buttons = btt;
        props.setChapter(chapter)
    };

    // const [buttons, _setButtons] = useState(props.chapter.chapterButtons.map((b, i) => ({...b, uid: i})))
    // const [chapter, _setChapter] = useState(props.chapter)
    const [changed, setChanged] = useState(props.chapter.newChapter);
    // const [chapterText, _setChapterText] = useState(props.chapter.text)

    // useEffect(() => {
    //     console.log( '- Has changed');
    //     // setChanged(true)
    // },[buttons])
    const setChapter = (chapter) => {
        setChapterText(chapter.text);
        setButtons(chapter.chapterButtons.map((b, i) => ({...b, uid: i})));
        _setChapter(chapter);
    }

    const setChapterText = (text) => {
        chapter.text = text
        // chapterText = text
        _setChapterText(text)
    }
    const setButtons = (buttons) => {
        chapter.chapterButtons = buttons;
        _setButtons(buttons)
        setChanged(true)
    }

    const removeButton = (uid)=>{
        let btts = buttons.filter(b=>b.uid!==uid);
        btts.forEach((b,i)=>b.uid = i)
        console.log('REMOVED: =========================')
        console.log(btts)
        setButtons(btts)
    }

    const addButton = () => {
        let maxPLacement = buttons.length > 0 ? Math.max(...buttons.map(o => o.placement)) : 0;
        let maxUid = Math.max(...buttons.map(o => o.uid))
        let newButton = {
            id: null,
            text: '_____',
            targetChapterId: chapter.itemId,
            placement: maxPLacement + 1,
            uid: maxUid + 1
        }
        let newButtons = [...buttons]
        newButtons.push(newButton)
        setButtons(newButtons);
        setChanged(true);
    }
    const setNoteText = (text) => {
        chapter.note = text;
        setChapter(chapter)
        setChanged(true)
    }

    const handleTextareaChange = (event) => {
        // chapter.text = event.target.value;
        // setChapter(chapter)
        // event.preventDefault()
        // setChapterText(event.target.value)
        setChapterText(event.target.value)
        setChanged(true)
    }


    const onSaveChapter = () => {
        console.log(chapter);
        fetch(API_URL + '/chapters/save-chapters', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({chapters: [chapter]})
        }).then(response => {
            console.log(response)
            return response.json()
        })
            .then(data => {
                console.log(data);
                setChapter({...data[0], uid: chapter.uid})
                setChanged(false)
            })
    }
    const onLoadChapter = () => {
        if (!!chapter.id) {
            fetch(API_URL + '//chapters/get-chapter', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({itemId: chapter.itemId, versionId: chapter.dataVersionId})
            })
                .then(response => {
                    console.log(response)
                    return response.json()
                })
                .then(data => {
                    setChapter(data);
                    //  setChapterText(chapter.text)
                    setChanged(false);
                })
        }
    }
    const onDeleteChapter = () => { // TODO
    }

    const ChapterButton = (props) => {
        // console.log(props)
        const [button, setButton] = useState(props.button)
        const moveUp = () => {
            button.placement = button.placement - 1;
            updateButtons()
        }
        const moveDown = () => {
            button.placement = button.placement + 1;
            updateButtons()
        }
        const updateButtons = () => {
            setButton(button);
            let index = props.buttons.findIndex(x => x.uid === button.uid);
            let buttonsCopy = [...props.buttons]
            buttonsCopy[index].placement = button.placement
            props.setButtons(buttonsCopy)
        }
        const removeButton = () => {
            props.removeButton(button.uid)
        }

        const setButtonText = (text) => {
            let index = buttons.findIndex(x => x.uid === button.uid);
            let buttonsCopy = [...props.buttons]
            buttonsCopy[index].text = text
            props.setButtons(buttonsCopy)
        }

        const setButtonTarget = (targetId) => {
            if (!!targetId && button.targetChapterId !== targetId) {
                button.targetChapterId = targetId;
                updateButtons()
            }
        }

        const chaptersList = props.chapters
            .map(c =>
                <Dropdown.Item
                    eventKey={c.itemId}
                    active={c.itemId === button.targetChapterId}>
                    {'[' + c.itemId + '] ' + c.note}
                </Dropdown.Item>)

        return (
            <ButtonGroup className='w-100 row-cols-3 h-100'>

                <EditableText initialText={button.text} setText={setButtonText} setClass='btn btn-primary col-9 text-center'/>

                <div className='col-1 text-white text-center bg-primary'>
                    <Row >
                        <div className='bg-primary col-1 text-center text-white w-100'>
                            {button.placement}
                        </div>
                    </Row>
                    <Row>
                        <span onClick={moveUp} className='btn btn-primary m-0 p-0 w-100 h-100' style={{fontSize: 10}}>▲</span>
                    </Row>
                    <Row>
                        <span onClick={moveDown} className='btn btn-primary m-0 p-0 w-100 h-100' style={{fontSize: 10}}>▼</span>
                    </Row>
                </div>
                <Dropdown className='col-1' onSelect={function (evt) {setButtonTarget(evt)}}>
                    <Dropdown.Toggle split variant="primary" id="dropdown-split-basic" className='rounded-0 h-100 p-1 w-100'/>
                    <Dropdown.Menu className='w-100'>
                        {chaptersList}
                    </Dropdown.Menu>
                </Dropdown>

                <div className='col-1 btn btn-primary btn-outline-danger p-1' style={{fontSize: 10}} onClick={removeButton}>X</div>
                {/*</Dropdown>*/}
            </ButtonGroup>

        );
    }


    let buttonGroups = buttons.reduce((group, ch) => {
        const {placement} = ch;
        group.set(placement, group.get(placement) ?? []);
        group.get(placement).push(ch);
        return group;
    }, new Map())
    let buttonLists = Array.from(buttonGroups.keys()).sort((a, b) => a - b).map(n => buttonGroups.get(n))

    // console.log(JSON.stringify(buttonLists));

    let buttons2 = buttonLists.map(l => {
        let btt = l.sort((a, b) => b.id - a.id).map(b => {
            return (<Col className='px-1 flex-grow-1'>
                <ChapterButton button={b} buttons={buttons} chapters={props.chapters} setButtons={setButtons} removeButton={removeButton}/>
            </Col>);
        })
        return (
            <Row className={'p-1 ' + 'row-cols-' + btt.length}>
                {btt}
            </Row>
        );
    })

    return (
        <Container className='bg-light rounded-3 m-1 p-2 h-100'>
            <Card className={'h-100 ' + (changed ? 'bg-warning' : '')}>
                <Card.Header>
                    <Row className='row-cols-2 w-100 mx-0 justify-content-between'>
                        <Col>
                            <p className='m-0'
                               style={{fontSize: 15}}>{'[' + (chapter.itemId == null ? '_' : chapter.itemId) + ']'}</p>
                        </Col>
                        <Col className='col-3 align-self-end'>
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

                    <Col>
                        <Form.Control as="textarea" rows={3} className='m-1' value={chapterText}
                                      onChange={handleTextareaChange}/>
                        {buttons2}
                        <Row className='px-1'>
                            <Col className='p-0'>
                                <Button variant='outline-primary' className='w-100 m-1 bg-white' onClick={addButton}>
                                    Добавить
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                </Card.Body>
            </Card>


        </Container>
    );
}