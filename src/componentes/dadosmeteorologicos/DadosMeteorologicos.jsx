"use client";

import { useState, useEffect } from "react";
import { Container, Row, Col, Form, FloatingLabel, Button, Table } from "react-bootstrap";
import Plot from "react-plotly.js";
import Alerta from "../comuns/Alerta";
import cidadesData from "../../dados/cidades";
import * as XLSX from 'xlsx';

export default function WeatherDataViewer() {
    const [alerta, setAlerta] = useState({ status: "", message: "" });
    const [cidades, setCidades] = useState(cidadesData);
    const [formData, setFormData] = useState({
        dataInicial: "",
        dataFinal: "",
        latitude: "-28.2612",
        longitude: "-52.4083",
        modelo: "ecmwf_ifs", // Modelo padrão inicial
    });

    const [dados, setDados] = useState([]);

    useEffect(() => {
        const today = new Date();
        const finalDate = new Date(today);
        finalDate.setDate(today.getDate() - 3);

        const initialDate = new Date(today);
        initialDate.setDate(today.getDate() - 30);

        setFormData(prevData => ({
            ...prevData,
            dataInicial: initialDate.toISOString().split("T")[0],
            dataFinal: finalDate.toISOString().split("T")[0],
        }));
    }, []);

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

    const handleConsultar = async () => {
        const { dataInicial, dataFinal, latitude, longitude, modelo } = formData;

        if (!dataInicial || !dataFinal || !latitude || !longitude || !modelo) {
            setAlerta({ status: "error", message: "Por favor, preencha todos os campos." });
            return;
        }

        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        // Inclusão do parâmetro models=${modelo}
        const url = `${protocol}://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${dataInicial}&end_date=${dataFinal}&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum,shortwave_radiation_sum,relative_humidity_2m_mean,sunshine_duration&models=${modelo}&timezone=America%2FSao_Paulo`;

        try {
            const res = await fetch(url);
            const json = await res.json();

            if (json.error) {
                throw new Error(json.reason || "Erro na consulta à API.");
            }

            const tempsMean = json.daily.temperature_2m_mean;
            const tempsMax = json.daily.temperature_2m_max;
            const tempsMin = json.daily.temperature_2m_min;
            const precipitation = json.daily.precipitation_sum;
            const radiation = json.daily.shortwave_radiation_sum;
            const humidity = json.daily.relative_humidity_2m_mean;
            const sunshine = json.daily.sunshine_duration;
            const dates = json.daily.time;

            const resultados = dates.map((date, idx) => ({
                date: date,
                tempMin: tempsMin[idx],
                tempMean: tempsMean[idx],
                tempMax: tempsMax[idx],
                precipitation: precipitation[idx],
                radiation: radiation[idx],
                humidity: humidity[idx],
                sunshineHours: sunshine[idx] / 3600, // Converte segundos para horas
            }));

            setDados(resultados);
            setAlerta({ status: "", message: "" });
        } catch (error) {
            console.error("Erro ao consultar API:", error);
            setAlerta({ status: "error", message: `Erro: ${error.message}` });
        }
    };

    const handleExport = () => {
        const dadosFormatados = dados.map(row => ({
            Data: row.date,
            'Temperatura Mínima (°C)': row.tempMin,
            'Temperatura Média (°C)': row.tempMean,
            'Temperatura Máxima (°C)': row.tempMax,
            'Precipitação (mm)': row.precipitation,
            'Radiação Solar (MJ/m²)': row.radiation,
            'Umidade Relativa (%)': row.humidity,
            'Horas de Insolação (h)': row.sunshineHours,
        }));
        
        const worksheet = XLSX.utils.json_to_sheet(dadosFormatados);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Dados Meteorológicos");
        
        XLSX.writeFile(workbook, "dados_meteorologicos.xlsx");
    };

    return (
        <Container className="mt-4">
            <Row>
                <Col>
                    <h2 className="text-center mb-4">Consulta de Dados Meteorológicos Históricos</h2>
                    <Alerta alerta={alerta} />
                </Col>
            </Row>

            {/* Formulário */}
            <Row className="g-2">
                <Col md>
                    <FloatingLabel label="Data Inicial">
                        <Form.Control type="date" name="dataInicial" value={formData.dataInicial} onChange={handleChange} />
                    </FloatingLabel>
                </Col>
                <Col md>
                    <FloatingLabel label="Data Final">
                        <Form.Control type="date" name="dataFinal" value={formData.dataFinal} onChange={handleChange} />
                    </FloatingLabel>
                </Col>
                <Col md>
                    <FloatingLabel label="Modelo">
                        <Form.Select 
                            aria-label="Selecione um modelo" 
                            name="modelo" 
                            value={formData.modelo} 
                            onChange={handleChange}
                        >
                            <option value="ecmwf_ifs">ECMWF IFS</option>
                            <option value="era5_land">ERA5-Land</option>
                            <option value="era5">ERA5</option>
                        </Form.Select>
                    </FloatingLabel>
                </Col>
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
                    <Button variant="primary" onClick={handleConsultar}>Consultar Dados</Button>
                </Col>
            </Row>

            {/* Botão de Exportar para Excel */}
            {dados.length > 0 && (
                <Row className="mt-4">
                    <Col className="text-center">
                        <Button variant="success" onClick={handleExport}>
                            Exportar para Excel
                        </Button>
                    </Col>
                </Row>
            )}

            {/* Tabela */}
            {dados.length > 0 && (
                <Row className="mt-4">
                    <Col>
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Temperatura Mínima (°C)</th>
                                    <th>Temperatura Média (°C)</th>
                                    <th>Temperatura Máxima (°C)</th>
                                    <th>Precipitação (mm)</th>
                                    <th>Radiação Solar (MJ/m²)</th>
                                    <th>Umidade Relativa (%)</th>
                                    <th>Horas de Insolação (h)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dados.map((row, idx) => (
                                    <tr key={idx}>
                                        <td>{row.date}</td>
                                        <td>{row.tempMin?.toFixed(1) ?? "-"}</td>
                                        <td>{row.tempMean?.toFixed(1) ?? "-"}</td>
                                        <td>{row.tempMax?.toFixed(1) ?? "-"}</td>
                                        <td>{row.precipitation?.toFixed(1) ?? "-"}</td>
                                        <td>{row.radiation?.toFixed(1) ?? "-"}</td>
                                        <td>{row.humidity?.toFixed(1) ?? "-"}</td>
                                        <td>{row.sunshineHours?.toFixed(1) ?? "-"}</td>
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
                    <Col md={12}>
                        <h5 className="text-center">Valores Diários</h5>
                        <Plot
                            data={[
                                {
                                    x: dados.map((d) => d.date),
                                    y: dados.map((d) => d.tempMin),
                                    type: "scatter",
                                    mode: "lines+markers",
                                    name: "Temperatura Mínima (°C)",
                                    line: { color: "blue" },
                                },
                                {
                                    x: dados.map((d) => d.date),
                                    y: dados.map((d) => d.tempMean),
                                    type: "scatter",
                                    mode: "lines+markers",
                                    name: "Temperatura Média (°C)",
                                    line: { color: "green" },
                                },
                                {
                                    x: dados.map((d) => d.date),
                                    y: dados.map((d) => d.tempMax),
                                    type: "scatter",
                                    mode: "lines+markers",
                                    name: "Temperatura Máxima (°C)",
                                    line: { color: "red" },
                                },
                                {
                                    x: dados.map((d) => d.date),
                                    y: dados.map((d) => d.precipitation),
                                    type: "bar",
                                    name: "Precipitação (mm)",
                                    marker: { color: "blue" },
                                    yaxis: 'y2'
                                },
                                {
                                    x: dados.map((d) => d.date),
                                    y: dados.map((d) => d.radiation),
                                    type: "scatter",
                                    mode: "lines+markers",
                                    name: "Radiação (MJ/m²)",
                                    line: { color: "orange" },
                                    yaxis: 'y3'
                                },
                                {
                                    x: dados.map((d) => d.date),
                                    y: dados.map((d) => d.humidity),
                                    type: "scatter",
                                    mode: "lines+markers",
                                    name: "Umidade Relativa (%)",
                                    line: { color: "purple" },
                                    yaxis: 'y4'
                                },
                                {
                                    x: dados.map((d) => d.date),
                                    y: dados.map((d) => d.sunshineHours),
                                    type: "scatter",
                                    mode: "lines+markers",
                                    name: "Insolação (h)",
                                    line: { color: "yellow" },
                                    yaxis: 'y5'
                                },
                            ]}
                            layout={{
                                autosize: true,
                                xaxis: { title: "Data" },
                                yaxis: { title: "Temperatura (°C)" },
                                yaxis2: {
                                    title: "Precipitação (mm)",
                                    overlaying: 'y',
                                    side: 'right',
                                    anchor: 'free',
                                    position: 0.95
                                },
                                yaxis3: {
                                    title: "Radiação (J/m²)",
                                    overlaying: 'y',
                                    side: 'right',
                                    anchor: 'free',
                                    position: 1.05
                                },
                                yaxis4: {
                                    title: "Umidade Relativa (%)",
                                    overlaying: 'y',
                                    side: 'right',
                                    anchor: 'free',
                                    position: 1.15
                                },
                                yaxis5: {
                                    title: "Insolação (h)",
                                    overlaying: 'y',
                                    side: 'right',
                                    anchor: 'free',
                                    position: 1.25
                                }
                            }}
                            style={{ width: "100%", height: "400px" }}
                        />
                    </Col>
                </Row>
            )}
        </Container>
    );
}