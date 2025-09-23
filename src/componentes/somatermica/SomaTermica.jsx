"use client";

import { useState } from "react";
import { Container, Row, Col, Form, FloatingLabel, Button, Table } from "react-bootstrap";
import Plot from "react-plotly.js";
import Alerta from "../comuns/Alerta";
import cidadesData from "../../dados/cidades";

export default function GrauDiaCalculator() {

    const [alerta, setAlerta] = useState({ status: "", message: "" });
    const [cidades, setCidades] = useState(cidadesData);
    const [formData, setFormData] = useState({
        dataSemeadura: "2024-09-01",
        tb: "10",
        topt: "25",
        tmax: "34",
        latitude: "-28.2612",
        longitude: "-52.4083",
        limiar: "830",
    });

    const [dados, setDados] = useState([]);
    const [diasLimiar, setDiasLimiar] = useState({ m1: null, m2: null, m3: null });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

  const handleCityChange = (e) => {
        const cidadeNome = e.target.value;
        const cidadeSelecionada = cidades.find(c => c.nome === cidadeNome);

        if (cidadeSelecionada) {
            setFormData({
                ...formData,
                latitude: cidadeSelecionada.latitude.toString(),
                longitude: cidadeSelecionada.longitude.toString(),
            });
        }
    };    

    // Função para calcular graus-dia por cada método
    const calcularGrausDia = (temp, tb, topt, tmax) => {
        let m1 = 0, m2 = 0, m3 = 0;

        // Método 1
        if (temp >= tb) m1 = temp - tb;

        // Método 2
        if (temp >= tb && temp <= topt) {
            m2 = temp - tb;
        } else if (temp > topt) {
            m2 = topt - tb;
        }

        // Método 3
        if (temp >= tb && temp <= topt) {
            m3 = temp - tb;
        } else if (temp > topt && temp <= tmax) {
            m3 = ((tmax - temp) * (topt - tb)) / (tmax - topt);
        }

        return { m1, m2, m3 };
    };

    // Função que consulta a API e calcula resultados
    const handleCalcular = async () => {
        const { dataSemeadura, tb, topt, tmax, latitude, longitude, limiar } = formData;

        const startDate = dataSemeadura;
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() - 3); // pega alguns meses à traz
        const end = endDate.toISOString().split("T")[0];

        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const url = `${protocol}://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${end}&daily=temperature_2m_mean&timezone=America%2FSao_Paulo`;
        console.log(url);
        try {
            const res = await fetch(url);
            const json = await res.json();

            const temps = json.daily.temperature_2m_mean;
            const dates = json.daily.time;

            let soma1 = 0,
                soma2 = 0,
                soma3 = 0;
            let dias1 = null,
                dias2 = null,
                dias3 = null;

            const resultados = [];
            let stop = false;

            for (let idx = 0; idx < dates.length && !stop; idx++) {
                const temp = temps[idx];
                const { m1, m2, m3 } = calcularGrausDia(
                    temp,
                    parseFloat(tb),
                    parseFloat(topt),
                    parseFloat(tmax)
                );

                soma1 += m1;
                soma2 += m2;
                soma3 += m3;

                if (dias1 === null && soma1 >= limiar) dias1 = idx + 1;
                if (dias2 === null && soma2 >= limiar) dias2 = idx + 1;
                if (dias3 === null && soma3 >= limiar) dias3 = idx + 1;

                resultados.push({
                    dia: idx + 1,
                    date: dates[idx],
                    temp,
                    m1,
                    soma1,
                    m2,
                    soma2,
                    m3,
                    soma3,
                });

                // Se os três atingirem o limiar, parar
                if (dias1 && dias2 && dias3) stop = true;
            }

            setDados(resultados);
            setDiasLimiar({ m1: dias1, m2: dias2, m3: dias3 });
        } catch (error) {
            console.error("Erro ao consultar API:", error);

            setAlerta({ status: "error", message: error })
        }
    };

    return (
        <Container className="mt-4">
            <Row>
                <Col>
                    <h2 className="text-center mb-4">Calculadora de Soma Térmica (Grau Dia)</h2>
                    <Alerta alerta={alerta} />
                </Col>
            </Row>

            {/* Formulário */}
            <Row className="g-2">
                <Col md>
                    <FloatingLabel label="Data de Semeadura">
                        <Form.Control type="date" name="dataSemeadura" value={formData.dataSemeadura} onChange={handleChange} />
                    </FloatingLabel>
                </Col>
                <Col md>
                    <FloatingLabel label="Temperatura Base (Tb)">
                        <Form.Control type="number" step="0.1" name="tb" value={formData.tb} onChange={handleChange} />
                    </FloatingLabel>
                </Col>
                <Col md>
                    <FloatingLabel label="Temperatura Ótima (Topt)">
                        <Form.Control type="number" step="0.1" name="topt" value={formData.topt} onChange={handleChange} />
                    </FloatingLabel>
                </Col>
                <Col md>
                    <FloatingLabel label="Temperatura Máxima (Tmax)">
                        <Form.Control type="number" step="0.1" name="tmax" value={formData.tmax} onChange={handleChange} />
                    </FloatingLabel>
                </Col>
                <Col md>
                    <FloatingLabel label="Limiar (graus-dia)">
                        <Form.Control type="number" step="0.1" name="limiar" value={formData.limiar} onChange={handleChange} />
                    </FloatingLabel>
                </Col>
            </Row>

            <Row className="g-2 mt-2">
                <Col md>
                    <FloatingLabel label="Latitude">
                        <Form.Control type="number" step="0.01" name="latitude" value={formData.latitude} onChange={handleChange} />
                    </FloatingLabel>
                </Col>
                <Col md>
                    <FloatingLabel label="Longitude">
                        <Form.Control type="number" step="0.01" name="longitude" value={formData.longitude} onChange={handleChange} />
                    </FloatingLabel>
                </Col>
                <Col md>
                    <FloatingLabel label="Cidades">
                        <Form.Select aria-label="Selecione uma cidade" onChange={handleCityChange}>
                            <option value="">Selecione uma cidade</option>
                            {cidades.map((cidade, index) => (
                                <option key={index} value={cidade.nome}>
                                    {cidade.nome}
                                </option>
                            ))}
                        </Form.Select>
                    </FloatingLabel>
                </Col>
            </Row>

            <Row className="mt-3">
                <Col className="text-center">
                    <Button variant="primary" onClick={handleCalcular}>Calcular</Button>
                </Col>
            </Row>

            {/* Tabela */}
            {dados.length > 0 && (
                <Row className="mt-4">
                    <Col>
                        <div className="mt-3 text-center">
                            <h5>Dias para atingir o limiar:</h5>
                            <p>Método 1: {diasLimiar.m1 ?? "Não atingiu"}</p>
                            <p>Método 2: {diasLimiar.m2 ?? "Não atingiu"}</p>
                            <p>Método 3: {diasLimiar.m3 ?? "Não atingiu"}</p>
                        </div>
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Dias</th>
                                    <th>Data</th>
                                    <th>Temperatura (°C)</th>
                                    <th>Método 1</th>
                                    <th>Soma M1</th>
                                    <th>Método 2</th>
                                    <th>Soma M2</th>
                                    <th>Método 3</th>
                                    <th>Soma M3</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dados.map((row, idx) => (
                                    <tr key={idx}>
                                        <td>{row.dia}</td>
                                        <td>{row.date}</td>
                                        <td>{row.temp.toFixed(1)}</td>
                                        <td>{row.m1.toFixed(1)}</td>
                                        <td>{row.soma1.toFixed(1)}</td>
                                        <td>{row.m2.toFixed(1)}</td>
                                        <td>{row.soma2.toFixed(1)}</td>
                                        <td>{row.m3.toFixed(1)}</td>
                                        <td>{row.soma3.toFixed(1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>


                    </Col>
                </Row>
            )}

            {/* Gráficos */}
            {dados.length > 0 && (
                <Row className="mt-5">
                    <Col md={12} className="mb-4">
                        <h5 className="text-center">Somatório Acumulado por Método</h5>
                        <Plot
                            data={[
                                {
                                    x: dados.map((d) => d.dia),
                                    y: dados.map((d) => d.soma1),
                                    type: "scatter",
                                    mode: "lines+markers",
                                    name: "Método 1",
                                    line: { color: "blue" },
                                },
                                {
                                    x: dados.map((d) => d.dia),
                                    y: dados.map((d) => d.soma2),
                                    type: "scatter",
                                    mode: "lines+markers",
                                    name: "Método 2",
                                    line: { color: "green" },
                                },
                                {
                                    x: dados.map((d) => d.dia),
                                    y: dados.map((d) => d.soma3),
                                    type: "scatter",
                                    mode: "lines+markers",
                                    name: "Método 3",
                                    line: { color: "yellow" },
                                },
                                {
                                    x: dados.map((d) => d.dia),
                                    y: dados.map(() => parseFloat(formData.limiar)),
                                    type: "scatter",
                                    mode: "lines",
                                    name: "Limiar",
                                    line: { color: "black", dash: "dot" },
                                },
                            ]}
                            layout={{ autosize: true, xaxis: { title: "Dias" }, yaxis: { title: "Soma (Graus-dia)" } }}
                            style={{ width: "100%", height: "400px" }}
                        />
                    </Col>

                    <Col md={12}>
                        <h5 className="text-center">Valor Diário por Método</h5>
                        <Plot
                            data={[
                                {
                                    x: dados.map((d) => d.dia),
                                    y: dados.map((d) => d.m1),
                                    type: "scatter",
                                    mode: "lines+markers",
                                    name: "Método 1",
                                    line: { color: "blue" },
                                },
                                {
                                    x: dados.map((d) => d.dia),
                                    y: dados.map((d) => d.m2),
                                    type: "scatter",
                                    mode: "lines+markers",
                                    name: "Método 2",
                                    line: { color: "green" },
                                },
                                {
                                    x: dados.map((d) => d.dia),
                                    y: dados.map((d) => d.m3),
                                    type: "scatter",
                                    mode: "lines+markers",
                                    name: "Método 3",
                                    line: { color: "yellow" },
                                },
                                {
                                    x: dados.map((d) => d.dia),
                                    y: dados.map((d) => d.temp),
                                    type: "scatter",
                                    mode: "lines+markers",
                                    name: "Temperatura",
                                    line: { color: "red" },
                                },
                            ]}
                            layout={{ autosize: true, xaxis: { title: "Dias" }, yaxis: { title: "Valor Diário (Graus-dia)" } }}
                            style={{ width: "100%", height: "400px" }}
                        />
                    </Col>
                </Row>
            )}
        </Container>
    );
}
