import logo from './logo.svg';
import './App.css';
import ChapterForm from "./components/ChapterForm";
import {Badge, Button, Col, Container, Row, Toast, Jum, Card} from "react-bootstrap";
import * as React from "react";
import {useState} from "react";

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            chapters: []}
        this.addChapter = this.addChapter.bind(this)
    }

    componentDidMount() {
        fetch("http://localhost:5000/chapters")
            .then(response => {
                return response.json()
            })
            .then(data => this.setState({chapters: data}))
    }

    addChapter(){
        let newChapter = {
            id: null,
            text: 'Новый раздел',
            note: 'Новый раздел',
            chapterButtons: [],
            newChapter: true
        }
        let chapters = [...this.state.chapters]
        chapters.push(newChapter)
        // console.log(chapters)
        this.setState({chapters: chapters})
    }

    render() {
        let chapters = this.state.chapters.map((c, i) =>
            <Col className='px-0 col-4'>
                <ChapterForm key={i} chapter={c} chapters={this.state.chapters}/>
            </Col>
        )

        return (
            <Container className="p-3">
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
