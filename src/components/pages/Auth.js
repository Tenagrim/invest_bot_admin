import {Button, Card, Col, Container, Form, Row} from "react-bootstrap";
import {useLocation, useNavigate} from "react-router-dom";
import {useState} from "react";
import {API} from "../AxiosInterceptor";


export const AuthPage = (props) => {

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/home";
    // const { auth, setAuth } = useAuth();
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        console.log("submit+++");
        debugger
        e.preventDefault();
        try {
            const res = await API.post("/auth/login", {
                username: name,
                password: password
            }).then((res) => {
                debugger
                // API.headers = {Authorization:'Bearer ' + res.headers.authorization}
                if (res.headers.hasAuthorization()) {
                    setName("");
                    setPassword("");
                    localStorage.setItem("token", res.headers.authorization)
                    navigate(from, {replace: true});
                } else {
                    console.log("incorrect submission");
                    setError(res.message);
                }
            });
        } catch (err) {
            console.log(err)
            if (!err?.response) {
                setError("no server response");
            } else {
                let errorStr = 'something went wrong';
                debugger
                if (err.response.status === 401) {
                    errorStr = "wrong password";
                } else if (err.response.status === 404) {
                    errorStr = 'user not found';
                }
                setError(errorStr);
            }
        }
    };

    return (
        <Container className='mx-auto my-auto col-10 col-md-8 col-lg-6'>
            <Row className='justify-content-center align-items-center h-100'>
                <Col className='col-6'>
                    <Card>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Label>Username</Form.Label>
                                <Form.Control onChange={e => setName(e.target.value)} type="username"
                                              placeholder="Enter username"/>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formBasicPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control onChange={e => setPassword(e.target.value)} type="password"
                                              placeholder="Password"/>
                            </Form.Group>
                            <p className='text-danger' >{error}</p>
                            <Button variant="primary" type="submit">
                                Submit
                            </Button>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </Container>
    );

}