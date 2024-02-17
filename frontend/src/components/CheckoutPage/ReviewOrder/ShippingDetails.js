import React, { useState, useEffect } from 'react';
import { Typography, Grid, Button, TextField, IconButton, Tooltip } from '@material-ui/core';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import useStyles from './styles'; // Asegúrate de importar tus estilos

function PaymentDetails(props) {
  const { formValues, onInputChange } = props;
  const classes = useStyles(); // Asegúrate de tener tus estilos importados si los necesitas
  const { plan } = formValues;
  const [comprobanteType, setComprobanteType] = useState('factura');
  const [metodoPago, setMetodoPago] = useState('Yape');
  const [numeroOperacionError, setNumeroOperacionError] = useState('');
  const [numeroOperacion, setNumeroOperacion] = useState('');
  const [numeroRuc, setNumeroRuc] = useState('');
  const [numeroRucError, setNumeroRucError] = useState('');
  const [pagoVerificado, setPagoVerificado] = useState(false);
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);
  const [popupCerrado, setPopupCerrado] = useState(false); // Nuevo estado para controlar el cierre del popup

  const newPlan = JSON.parse(plan);
  const { users, connections, price } = newPlan;

  const handleComprobanteChange = (type) => {
    setComprobanteType(type);
    if (type === 'boleta') {
      setNumeroRuc('');
      setNumeroRucError('');
    }
  };

  const handleMetodoPagoChange = (method) => {
    setMetodoPago(method);
    if (method === 'BCP') {
      setNumeroOperacionError('');
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getComprobanteContent = () => {
    if (comprobanteType === 'factura') {
      const precioConIGV = price * 1.18;
      return `Total + IGV: S/ ${precioConIGV.toLocaleString('es', { minimumFractionDigits: 2 })}`;
    } else {
      return `Total: S/ ${price.toLocaleString('es', { minimumFractionDigits: 2 })}`;
    }
  };

  const handleNumeroOperacionChange = (e) => {
    const value = e.target.value.trim();
    if (!/^\d*$/.test(value)) {
      setNumeroOperacionError('El número de operación debe contener solo números');
    } else {
      setNumeroOperacion(value);
      setNumeroOperacionError('');
    }
  };

  const handleNumeroRucChange = (e) => {
    const value = e.target.value.trim();
    if (!/^\d*$/.test(value)) {
      setNumeroRucError('El número de RUC debe contener solo números');
    } else {
      setNumeroRuc(value);
      setNumeroRucError('');
    }
  };

  const buildWhatsAppMessage = () => {
    let message = `Hola, aquí te envío los detalles del pago:
      Comprobante: *${comprobanteType}*
      Detalles del plan:
        - Colaboradores: *${users}*
        - Conexiones: *${connections}*
        - Pago: Mensual
        - *${getComprobanteContent()}*
      Método de pago: *${metodoPago}*
      Número de operación: *${numeroOperacion}*`;

    if (comprobanteType === 'factura') {
      message += `\nNúmero de RUC: *${numeroRuc}*`;
    }

    return encodeURIComponent(message);
  };

  const handleEnviarComprobante = () => {
    if (!numeroOperacion && (comprobanteType === 'factura' || metodoPago === 'BCP')) {
      setNumeroOperacionError('obligatorio');
    }
    if (!numeroRuc && comprobanteType === 'factura') {
      setNumeroRucError('obligatorio');
    }

    if (!numeroOperacionError && !numeroRucError) {
      const message = buildWhatsAppMessage();
      const whatsappUrl = `https://wa.me/51999053124/?text=${message}`;
      window.open(whatsappUrl, '_blank');
      setPagoVerificado(true);
      setMostrarNotificacion(true);
      setTimeout(() => {
        setMostrarNotificacion(false);
        setPopupCerrado(true); // Marcar el popup como cerrado después de 10 segundos
      }, 10000); // 10 segundos
    }
  };

  useEffect(() => {
    if (mostrarNotificacion) {
      const timer = setTimeout(() => {
        setMostrarNotificacion(false);
        setPopupCerrado(true); // Marcar el popup como cerrado después de 10 segundos
      }, 10000); // 10 segundos

      return () => clearTimeout(timer);
    }
  }, [mostrarNotificacion]);

  return (
    <>
      {!popupCerrado && ( // Mostrar el contenido del componente solo si el popup no está cerrado
        <Grid item xs={12} sm={12}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant={comprobanteType === 'factura' ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => handleComprobanteChange('factura')}
              >
                Con Factura
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant={comprobanteType === 'boleta' ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => handleComprobanteChange('boleta')}
              >
                Sin Factura
              </Button>
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom className={classes.title}>
            Detalles del plan
          </Typography>
          <Typography gutterBottom>Colaboradores: {users}</Typography>
          <Typography gutterBottom>Conexiones: {connections}</Typography>
          <Typography gutterBottom>Pago: Mensual</Typography>
          <Typography gutterBottom>{getComprobanteContent()}</Typography>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant={metodoPago === 'Yape' ? 'contained' : 'outlined'}
                color="secondary"
                onClick={() => handleMetodoPagoChange('Yape')}
              >
                Yape
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant={metodoPago === 'BCP' ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => handleMetodoPagoChange('BCP')}
              >
                BCP
              </Button>
            </Grid>
          </Grid>

          {(metodoPago === 'Yape' || metodoPago === 'BCP') && (
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <Typography variant="body1" align="center">
                  Cuenta {metodoPago === 'Yape' ? 'Yape: 999053124' : 'BCP: 28591647288082'}
                  <Tooltip title={metodoPago === 'Yape' ? 'Copiar Yape' : 'Copiar cuenta'} arrow placement="top">
                    <IconButton onClick={() => handleCopyToClipboard(metodoPago === 'Yape' ? '999053124' : '28591647288082')}>
                      <FileCopyIcon style={{ fontSize: 'small' }} />
                    </IconButton>
                  </Tooltip>
                </Typography>
              </Grid>
            </Grid>
          )}

          {metodoPago === 'BCP' && (
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <Typography variant="body1" align="center">
                  Cuenta CCI: 00228519164728808258
                  <Tooltip title="Copiar CCI" arrow placement="top">
                    <IconButton onClick={() => handleCopyToClipboard('00228519164728808258')}>
                      <FileCopyIcon style={{ fontSize: 'small' }} />
                    </IconButton>
                  </Tooltip>
                </Typography>
              </Grid>
            </Grid>
          )}

          <Typography variant="body1" align="center">
            Titular: Efrain Vitorino M.
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={comprobanteType === 'boleta' ? 12 : 6}>
              <TextField
                id="numeroOperacion"
                name="numeroOperacion"
                label="Número de Operación"
                variant="outlined"
                value={numeroOperacion}
                onChange={handleNumeroOperacionChange}
                fullWidth
                required={(comprobanteType === 'factura' || metodoPago !== '')}
                error={numeroOperacionError !== ''}
                helperText={numeroOperacionError}
              />
            </Grid>
            {comprobanteType === 'factura' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  id="numeroRuc"
                  name="numeroRuc"
                  label="Número de RUC"
                  variant="outlined"
                  value={numeroRuc}
                  onChange={handleNumeroRucChange}
                  fullWidth
                  required={comprobanteType === 'factura'}
                  error={numeroRucError !== ''}
                  helperText={numeroRucError}
                />
              </Grid>
            )}
          </Grid>

          {/* Botón de enviar comprobante */}
          <Grid container justify="center" style={{ marginTop: '20px' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<WhatsAppIcon style={{ color: 'white' }} />}
              onClick={handleEnviarComprobante}
              disabled={!numeroOperacion || !numeroRuc} // Deshabilitar el botón si no están completos los campos obligatorios
            >
              Enviar Comprobante
            </Button>
          </Grid>

          {/* Notificación de pago verificado */}
          {mostrarNotificacion && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <Typography variant="body1" style={{ color: 'green' }}>Verificando comprobante de pago</Typography>
              <CheckCircleIcon style={{ color: 'green' }} />
            </div>
          )}
        </Grid>
      )}
    </>
  );
}

export default PaymentDetails;
