import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export default function Sobre() {
    return (
        <Container className="d-flex justify-content-center mt-5">
            <Row>
                <Col>
                    <Card style={{ width: '18rem' }}>
                        <Card.Body className="text-center"> {/* Adicionada a classe text-center aqui */}
                            <Card.Title>Jorge Luis Boeira Bavaresco</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">2025</Card.Subtitle>
                            <Card.Text>
                                E-mail: jlbavaresco@gmail.com
                            </Card.Text>
                            {/* Você pode envolver os links em uma div se quiser mais controle sobre o espaçamento, ou deixá-los como estão */}
                            <div> {/* Opcional: para agrupar os links e talvez adicionar um espaçamento entre eles */}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}