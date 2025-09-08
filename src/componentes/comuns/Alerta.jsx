import { useState, useEffect } from "react";
import Alert from 'react-bootstrap/Alert';

const Alerta = ({ alerta }) => {

    const [exibir, setExibir] = useState(false);

    useEffect(() => {
        setExibir(true);
        setTimeout(() => {
            setExibir(false);
        }, 2000);
    }, [alerta]);

    return (
        <div>
            {(alerta.message.length > 0 && exibir) &&
                <Alert variant={alerta.status === 'error' ? 'danger' : 'primary' }>
                    {alerta.message}
                </Alert>
            }
        </div>
    )

}

export default Alerta;