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


    const [buttons, _setButtons] = useState(props.chapter.chapterButtons.map((b, i) => ({...b, uid: i})))
    const [chapter, _setChapter] = useState(props.chapter)
    const [changed, setChanged] = useState(props.chapter.newChapter);
    const [chapterText, _setChapterText] = useState(props.chapter.text)

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

    const addButton = () => {
        let maxPLacement = buttons.length > 0 ? Math.max(...buttons.map(o => o.placement)) : 0;
        let maxUid = Math.max(...buttons.map(o => o.uid))
        let newButton = {
            id: null,
            text: '_____',
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
        fetch(CHAPTERS_URL, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify({chapters: [chapter]})
        }).then(response => {
            console.log(response)
            return response.json()
        })
            .then(data => {
                console.log(data);
                setChapter(data[0])
                setChanged(false)

            })
    }
    const onLoadChapter = () => {
        if (!!chapter.id) {
            fetch(CHAPTERS_URL + '/' + chapter.id)
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
    const onDeleteChapter = () => {
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

        const setButtonText = (text) => {
            let index = buttons.findIndex(x => x.uid === button.uid);
            let buttonsCopy = [...props.buttons]
            buttonsCopy[index].text = text
            props.setButtons(buttonsCopy)
        }

        const setButtonTarget = (targetId) =>{
            if(!!targetId && button.targetChapterId != targetId){
                button.targetChapterId = targetId;
                updateButtons()
            }
        }

        const chaptersList = props.chapters.map(c=><Dropdown.Item eventKey={c.id}>{'[' + c.id + '] ' + c.note}</Dropdown.Item>)

        return (
            <Dropdown as={ButtonGroup} className='w-100 m-1 row-cols-4 h-100' onSelect={function(evt){setButtonTarget(evt)}}>
                {/*<Button variant="primary" className='col-10'>{props.text}</Button>*/}
                <EditableText initialText={button.text} setText={setButtonText} setClass='btn btn-primary col-10'/>
                <div className='bg-primary col-1 text-center text-white'>
                    {button.placement}
                </div>
                <ButtonGroup vertical className='col-1'>
                    <Button onClick={moveUp} className='pt-0 pb-0' style={{fontSize: 10}}>▲</Button>
                    <Button onClick={moveDown} className='pt-0 pb-0' style={{fontSize: 10}}>▼</Button>
                </ButtonGroup>
                <Dropdown.Toggle split variant="primary" id="dropdown-split-basic" className='col-1'/>
                <Dropdown.Menu className='w-100'>
                    {chaptersList}
                </Dropdown.Menu>
            </Dropdown>
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
                <ChapterButton button={b} buttons={buttons} chapters={props.chapters} setButtons={setButtons}/>
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
                        <Col >
                            <p className='m-0' style={{fontSize: 15}}>{'['+(chapter.id == null ? '_' : chapter.id)+']'}</p>
                        </Col>
                        <Col className='col-3 align-self-end'>
                            <ButtonGroup>
                                <Button className='btn-light btn-outline-secondary my-0 p-0' style={{fontSize: 15}}
                                        onClick={onLoadChapter}>🔃</Button>
                                <Button className='btn-light btn-outline-secondary my-0 p-0' style={{fontSize: 15}}
                                        onClick={onSaveChapter}>💾</Button>
                                <Button className='btn-light btn-outline-secondary my-0 p-0' style={{fontSize: 15}}
                                        onClick={onDeleteChapter}>❌</Button>
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
                        {/*<Row className='px-1'>*/}
                        {/*    <Col className='p-0'>*/}
                        {/*        <ChapterButton text='Cделки'/>*/}
                        {/*    </Col>*/}
                        {/*    <Col className='p-0'>*/}
                        {/*        <ChapterButton text='Мнооооооооого сделок'/>*/}
                        {/*    </Col>*/}
                        {/*    <Col className='p-0'>*/}
                        {/*        <ChapterButton text='О Нас'/>*/}
                        {/*    </Col>*/}

                        {/*</Row>*/}
                        {/*<Row className='px-1'>*/}
                        {/*    <Col className='p-0'>*/}
                        {/*        <ChapterButton text='Назад'/>*/}
                        {/*    </Col>*/}

                        {/*</Row>*/}
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