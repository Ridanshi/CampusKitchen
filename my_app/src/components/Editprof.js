import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AdmMenu from "./admin/AdminNavbar";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";

function Editprof() {
    let history = useNavigate();
    const { id } = useParams();

    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [contact, setContact] = useState("");
    const [result, setResult] = useState("");

    useEffect(
        () => {
            console.log(id);
            displayAdmin();
        },
        []
    )

    const displayAdmin = async (e) => {
        //e.preventDefault();
        let admindata = await axios.get("http://localhost:5000/get_admin");

        console.log(admindata);
        if (admindata) {
            setName(admindata.data.name);
            setAddress(admindata.data.address);
            setContact(admindata.data.contact);
        }
        else {
            setResult("Data Not Found")
        }
    };
    const handleOnSubmit = async (e) => {
        e.preventDefault();
        let result = await fetch(
            'http://localhost:5000/update_admin_profile', {
            method: "post",
            body: JSON.stringify({ name, address, contact }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        result = await result.json();
        console.log(result);

        if (result) {
            setResult("Data Updated successfully!");
            setName(name);
            setAddress(address);
            setContact(contact);
        }
        else {
            setResult("Data cannot be changed");
        }
    };

    return (
        <>
            <AdmMenu />
            <Container className="mt-4">
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                        <h4 className="text-center text-primary mb-4">Edit Medical Profile</h4>
                        <Form onSubmit={handleOnSubmit} className="p-4 border rounded shadow-sm bg-light">
                            <Form.Group className="mb-3">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter name"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Address</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Enter owner name"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Contact</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    placeholder="Enter address"
                                />
                            </Form.Group>
                            <div className="d-grid">
                                <Button type="submit" variant="primary">
                                    Update Profile
                                </Button>
                            </div>
                        </Form>
                        {result && (
                            <Alert className="mt-4" variant={result.includes("successfully") ? "success" : "danger"}>
                                {result}
                            </Alert>
                        )}
                    </Col>
                </Row>
            </Container>
        </>
    );
}
export default Editprof;