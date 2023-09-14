import {Button, ButtonGroup, Card, Col, Collapse, Container, Row} from "react-bootstrap";
import {useState} from "react";
import Dropdown from "react-bootstrap/Dropdown";
import * as React from "react";

export default function MasksSelector(props) {
    const [open, setOpen] = useState(false);
    const defaultFontSize = 15;
    let activeMarks = [];
    let inactiveMarks = [];
    if (!!props.marksList) {
         activeMarks = props.marksList
            .filter(m => ((1 << m.key) & props.marksKey))
            .sort((a, b) => a.key - b.key)
            .map(m => {
                return (
                    <Col className='col-auto p-0'>
                        <Button className='btn-light btn-outline-secondary p-1 w-100'
                                style={{fontSize: !!props.fontSize ? props.fontSize : defaultFontSize}}
                                onClick={() => props.unSetMark(m.key)}>{m.name}</Button>
                    </Col>
                );
            });
        inactiveMarks = props.marksList
            .filter(m => !((1 << m.key) & props.marksKey))
            .sort((a,b)=>a.key-b.key)
            .map(m => {
                return (
                    <Dropdown.Item
                        eventKey={m.key}
                        onClick={(e)=>{
                            props.setMark(m.key);
                            setOpen(false);
                            if(!!props.onClick)
                                props.onClick(e);
                        }}
                    >
                        {m.name}
                    </Dropdown.Item>
                );
            });
    }

    return (
        <div>
            <Container>
                <Row className='justify-content-start'>
                    {activeMarks}
                    <Col className='col-auto p-0'>
                        <Dropdown
                            open={open}
                            onSelect={(e) => {props.setMark(e);setOpen(false)}}
                            className='p-0 m-0'
                            variant='outline-secondary'
                            title=''>
                            <Dropdown.Toggle
                                variant='outline-secondary'
                                id="dropdown-split-basic"
                                style={{fontSize: !!props.fontSize?props.fontSize:defaultFontSize}}
                                className=' h-100 p-1 w-100'/>
                            <Dropdown.Menu className='w-100'>
                                {inactiveMarks}
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}