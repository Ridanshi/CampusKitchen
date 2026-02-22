import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AdmMenu from "./admin/AdminNavbar";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";

const API_BASE_URL = "https://campuskitchen-production.up.railway.app";

function Editprof() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [contact, setContact] = useState("");
    const [result, setResult] = useState("");

    const token = sessionStorage.getItem("token");

    useEffect(() => {
        displayAdmin();
    }, []);

    const displayAdmin = async () => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/get_admin/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data) {
                setName(response.data.name);
                setAddress(response.data.address);
                setContact(response.data.contact);
            }
        } catch (error) {
            console.error(error);
            setResult("Data Not Found");
        }
    };

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        setResult("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/update_admin_profile/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ name, address, contact }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setResult("Data Updated successfully!");
            } else {
                setResult(data.error || "Data cannot be changed");
            }
        } catch (error) {
            console.error(error);
            setResult("Something went wrong");
        }
    };

    return (
        <>
            <AdmMenu />
            <Container className="mt-4">
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                        <h4 className="text-center text-primary mb-4">
                            Edit Admin Profile
                        </h4>

                        <Form
                            onSubmit={handleOnSubmit}
                            className="p-4 border rounded shadow-sm bg-light"
                        >
                            <Form.Group className="mb-3">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Address</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Contact</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                />
                            </Form.Group>

                            <div className="d-grid">
                                <Button type="submit" variant="primary">
                                    Update Profile
                                </Button>
                            </div>
                        </Form>

                        {result && (
                            <Alert
                                className="mt-4"
                                variant={
                                    result.includes("successfully")
                                        ? "success"
                                        : "danger"
                                }
                            >
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