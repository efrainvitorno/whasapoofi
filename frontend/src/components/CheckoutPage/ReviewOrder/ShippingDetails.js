import React from 'react';
import { Typography, Grid, Button, TextField, IconButton, Tooltip } from '@material-ui/core';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import useStyles from './styles';

function PaymentDetails(props) {
  const { formValues, onInputChange } = props;
  const classes = useStyles();
  const { plan, correo, numeroRuc, numeroOperacion } = formValues;
  const [comprobanteType, setComprobanteType] = React.useState('factura');
  const [metodoPago, setMetodoPago] = React.useState('Yape');

  const newPlan = JSON.parse(plan);
  const { users, connections, price } = newPlan;

  const handleComprobanteChange = (type) => {
    setComprobanteType(type);
  };

  const handleMetodoPagoChange = (method) => {
    setMetodoPago(method);
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getComprobanteContent = () => {
    if (comprobanteType === 'factura') {
      const precioConIGV = price * 1.18;
      return `Total + IGV: S/ ${precioConIGV.toLocaleString('es', { minimumFractionDigits: 2 })}`;
    } else {
      return `Total: S/ ${price.toLocaleString('pt-br', { minimumFractionDigits: 2 })}`;
    }
  };

  return (
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
            variant={comprobanteType === 'sin IGV' ? 'contained' : 'outlined'}
            color="primary"
            onClick={() => handleComprobanteChange('sin IGV')}
          >
            Sin factura
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
            color="secondary" // Cambiado a color morado
            onClick={() => handleMetodoPagoChange('Yape')}
          >
            Yape
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            fullWidth
            variant={metodoPago === 'BCP' ? 'contained' : 'outlined'}
            color="primary" // Cambiado a color azul
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
              Número de cuenta {metodoPago === 'Yape' ? 'Yape: 123456789' : 'BCP: 987654321'}
              <Tooltip title={metodoPago === 'Yape' ? 'Copiar Yape' : 'Copiar BCP'} arrow placement="top">
                <IconButton onClick={() => handleCopyToClipboard(metodoPago === 'Yape' ? '123456789' : '987654321')}>
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
              Número de cuenta BCP 2: 987654322
              <Tooltip title="Copiar BCP 2" arrow placement="top">
                <IconButton onClick={() => handleCopyToClipboard('987654322')}>
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
        <Grid item xs={12} sm={comprobanteType === 'sin IGV' ? 12 : 6}> {/* Modificado aquí */}
          <TextField
            id="numeroOperacion"
            name="numeroOperacion"
            label="Número de Operación"
            variant="outlined"
            value={numeroOperacion}
            onChange={onInputChange}
            fullWidth
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
              onChange={onInputChange}
              fullWidth
            />
          </Grid>
        )}
      </Grid>
    </Grid>
  );
}

export default PaymentDetails;
