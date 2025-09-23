import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { NavLink, Outlet } from 'react-router';

function Menu() {
    return (
        <div>
            <Navbar expand="lg" className="bg-body-tertiary">
                <Container>
                    <NavLink className="navbar-brand" aria-current="page" exact="true" to="/">AgroClimatologia</NavLink>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <NavLink className="nav-link active" aria-current="page" exact="true" to="/">Home</NavLink>
                            <NavDropdown title="Programas" id="basic-nav-dropdown">
                                <NavLink className="dropdown-item" exact="true" to="somatermica">Soma Térmica</NavLink>
                                <NavLink className="dropdown-item" exact="true" to="dadosmeteo">Dados Meteorológicos</NavLink>
                            </NavDropdown>
                            <NavLink className="nav-link active" aria-current="page" exact="true" to="/sobre">Sobre...</NavLink>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Outlet />
        </div>
    );
}

export default Menu;