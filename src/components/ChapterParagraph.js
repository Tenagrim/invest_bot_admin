import {Button, ButtonGroup, Card, Col, Form, Row} from "react-bootstrap";
import ParagraphButton from "./ParagraphButton";
import * as React from "react";
import {useState} from "react";

export default  function  ChapterParagraph(props){

    const [text, setText] = useState(props.paragraph.text);
    let P = props.paragraph;
    const addButton=()=>{
        let buttons = props.paragraph.paragraphButtons;
        let maxPLacement = buttons.length > 0 ? Math.max(...buttons.map(o => o.placement)) : 0;
        let maxUid = buttons.length > 0 ? Math.max(...buttons.map(o => !!o.uid? o.uid : 0)) : 0;
        let newButton = {
            id: null,
            text: '_____',
            targetChapterId: props.chapter.itemId,
            placement: maxPLacement + 1,
            uid: maxUid + 1
        }
        let newButtons = [...buttons]
        newButtons.push(newButton);
        props.paragraph.paragraphButtons = newButtons;
        // props.setParagraph(props.paragraph);
        props.change();
    }

    const setButton = (button)=>{
        props.change()
    }

    const removeButton = (uid)=>{
        debugger
        let n= P.paragraphButtons.filter(p => ((!!p.id && p.id !== uid) || (!!p.uid && p.uid !== uid)));
        P.paragraphButtons = n;
        props.change();
    }

    const handleTextChange=(event)=>{
        // console.log('TEXT CHANGED: ' + event.target.text);
        // props.paragraph.text = event.target.text;
        // props.change();
        setText(event.target.value);
    }

    const handleBlur=()=>{
        props.paragraph.text = text;
        props.change();
    }
    const _handleKeyDown = (e) => {
    }

    const moveUp = () =>{
        props.moveUp(!!P.id? P.id : P.uid);
    }
    const moveDown = () =>{
        props.moveDown(!!P.id? P.id : P.uid);
    }
    const removeParagraph = () =>{
        props.remove(!!P.id? P.id : P.uid);
    }

    let buttonGroups = props.paragraph.paragraphButtons.reduce((group, ch) => {
        const {placement} = ch;
        group.set(placement, group.get(placement) ?? []);
        group.get(placement).push(ch);
        return group;
    }, new Map())
    let buttonLists = Array.from(buttonGroups.keys()).sort((a, b) => a - b).map(n => buttonGroups.get(n))

    // console.log(JSON.stringify(buttonLists));

    let buttons2 = buttonLists.map((l,i) => {
        let btt = l.sort((a, b) => b.id - a.id).map((b) => {
            return (
                <Col
                    key={!!b.id ? b.id : b.uid}
                    className='px-1 flex-grow-1'>
                    <ParagraphButton
                        button={b}
                        chapters={props.chapters}
                        setButton={setButton}
                        removeButton={removeButton}
                        marksList={props.marksList}
                        change={props.change}
                    />
                </Col>);
        })
        return (
            <Row key={i} className={'p-1 ' + 'row-cols-' + btt.length}>
                {btt}
            </Row>
        );
    })

    return (
        <Card>
            <Card.Body className='pt-0'>
                <Col className='col-12' hidden={props.hiddenMenu}>
                    <Row className='justify-content-end'>
                        <Col className='col-12'>
                        <ButtonGroup className='w-100'>
                            <Button className='btn-light btn-outline-secondary my-0 p-0' style={{fontSize: 15}} onClick={moveUp}>^</Button>
                            <Button className='btn-light btn-outline-secondary my-0 p-0' style={{fontSize: 15}} onClick={moveDown}>v</Button>
                            <Button className='btn-light btn-outline-danger my-0 p-0' style={{fontSize: 15}} onClick={removeParagraph}>x</Button>
                        </ButtonGroup>
                        </Col>
                    </Row>
                </Col>
                <Col className='col-12'>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        className='m-1'
                        value={text}
                        onChange={handleTextChange} onBlur={handleBlur}
                        onKeyDown={_handleKeyDown}

                    />
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

    );
}