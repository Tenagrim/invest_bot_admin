import {useState} from "react";
import {ButtonGroup, Col, Dropdown, Form, Row} from "react-bootstrap";
import MasksSelector from "./MarksSelector";
import * as React from "react";
import EditableText from "./EditableText";

export default function ParagraphButton (props) {
    // console.log(props)
    let _inputWasClicked = false;
    // const [button, setButton] = useState(props.button)
    const button = props.button;
    const [filterKey, setFilterKey] = useState(0)
    const [open, setOpen] = useState(false);
    const [filterString, setFilterString] = useState('')

    const setMark =(markId)=>{
        let newKey = (1<<markId) | filterKey;
        setFilterKey(newKey);
    }

    const unsetMark =(markId)=>{
        let newKey = (~(1<<markId)) & filterKey;
        setFilterKey(newKey);
    }

    const moveUp = () => {
        button.placement = button.placement - 1;
        props.setButton(button)
    }
    const moveDown = () => {
        button.placement = button.placement + 1;
        props.setButton(button)
    }
    // const updateButtons = () => {
    //     setButton(button);
    //     let index = props.buttons.findIndex(x => x.uid === button.uid);
    //     let buttonsCopy = [...props.buttons]
    //     buttonsCopy[index].placement = button.placement
    //     props.setButtons(buttonsCopy)
    // }
    const removeButton = () => {
        props.removeButton(!!button.id? button.id : button.uid)
    }

    const setButtonText = (text) => {
        button.text = text;
        // let index = props.buttons.findIndex(x => x.uid === button.uid);
        // let buttonsCopy = [...props.buttons]
        // buttonsCopy[index].text = text
        // props.setButtons(buttonsCopy)
        // button.text = text;
        // setButton(button);
        props.setButton(button);
    }

    const setButtonTarget = (targetId) => {
        if (!!targetId && button.targetChapterId !== targetId) {
            button.targetChapterId = targetId;
            // updateButtons()
            props.setButton(button);
        }
    }
    const onToggle= function(open) {
        if (_inputWasClicked) {
            _inputWasClicked = false;
            return;
        }
        setOpen(open);
    };
    const inputWasClicked= function() {
        _inputWasClicked = true;
    }


    const chaptersList = props.chapters
        .filter(ch=>(filterKey===0 || (ch.marksKey&filterKey))&&
            (filterString ==='' || ch.note.toLowerCase().includes(filterString.toLowerCase())))
        .map((c,i) =>
            <Dropdown.Item
                key={i}
                eventKey={c.itemId}
                active={c.itemId === button.targetChapterId}>
                {'[' + c.itemId + '] ' + c.note}
            </Dropdown.Item>)

    return (
        <ButtonGroup className='w-100 row-cols-3 h-100'>
            <Col className='col-1'>
            <Dropdown
                className='w-100 h-100'
                onSelect={function (evt) {setButtonTarget(Number(evt))}}
                open={open}
                onToggle={onToggle}>
                <Dropdown.Toggle split variant="primary" id="dropdown-split-basic" className='rounded-0 h-100 p-1 w-100'/>
                <Dropdown.Menu className='w-100'>
                    <Row>
                        <Col className='col-12'>
                            <Form.Control className=''
                                          onChange={e=>setFilterString(e.target.value)}></Form.Control>
                        </Col>
                    </Row>
                    <Row>
                        <Col className='col-12'>
                            <MasksSelector
                                marksList={props.marksList}
                                marksKey={filterKey}
                                setMark={setMark}
                                unSetMark={unsetMark}
                                fontSize={12}
                                onSelect={inputWasClicked}
                                onClick={(e)=>{    e.stopPropagation();
                                    e.nativeEvent.stopImmediatePropagation();}}
                            />
                        </Col>
                    </Row>

                    {chaptersList}
                </Dropdown.Menu>
            </Dropdown>
            </Col>
            <div className='col-1 text-white text-center bg-primary h-100' hidden={false}>
                <Row className='h-100'>
                    <Col className='col-12 p-0 m-0'  hidden={true}>
                        <div className='bg-primary col-1 text-center text-white w-100'>
                            {button.placement}
                        </div>
                    </Col>
                    <Col className='col-12  p-0 m-0 h-auto'>
                        <span onClick={moveUp} className='btn btn-primary rounded-0 m-0 p-0 w-100'
                              style={{fontSize: 9}}>▲</span>
                    </Col>
                    <Col className='col-12  p-0 m-0 h-auto'>
                        <span onClick={moveDown} className='btn btn-primary rounded-0 m-0 p-0 w-100'
                              style={{fontSize: 9}}>▼</span>
                    </Col>
                </Row>
            </div>
            <EditableText initialText={button.text} setText={setButtonText} setClass='btn btn-primary col-9 text-center'/>

            <div className='col-1 btn btn-primary btn-outline-danger p-1' style={{fontSize: 10}} onClick={removeButton}>X</div>
            {/*</Dropdown>*/}
        </ButtonGroup>

    );
}