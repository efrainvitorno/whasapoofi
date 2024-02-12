import React, { useContext, useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  CircularProgress,
} from "@material-ui/core";
import { Formik, Form } from "formik";

import AddressForm from "./Forms/AddressForm";
import PaymentForm from "./Forms/PaymentForm";
import ReviewOrder from "./ReviewOrder";
import CheckoutSuccess from "./CheckoutSuccess";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/Auth/AuthContext";

import validationSchema from "./FormModel/validationSchema";
import checkoutFormModel from "./FormModel/checkoutFormModel";
import formInitialValues from "./FormModel/formInitialValues";

import useStyles from "./styles";
import Invoices from "../../pages/Financeiro";

export default function CheckoutPage(props) {
  const steps = ["Datos", "Personalizar", "Revisar"];
  const { formId, formField } = checkoutFormModel;

  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(1);
  const [datePayment, setDatePayment] = useState(null);
  const [invoiceId, setinvoiceId] = useState(props.Invoice.id);
  const currentValidationSchema = validationSchema[activeStep];
  const isLastStep = activeStep === steps.length - 1;
  const { user } = useContext(AuthContext);

  function _renderStepContent(step, setFieldValue, setActiveStep, values) {
    switch (step) {
      case 0:
        return <AddressForm formField={formField} values={values} setFieldValue={setFieldValue} />;
      case 1:
        return <PaymentForm
          formField={formField}
          setFieldValue={setFieldValue}
          setActiveStep={setActiveStep}
          activeStep={step}
          invoiceId={invoiceId}
          values={values}
        />;
      case 2:
        return <ReviewOrder />;
      default:
        return <div>Not Found</div>;
    }
  }

  async function _submitForm(values, actions) {
    try {
      const plan = JSON.parse(values.plan);
      const newValues = {
        firstName: values.firstName,
        lastName: values.lastName,
        address2: values.address2,
        city: values.city,
        state: values.state,
        zipcode: values.zipcode,
        country: values.country,
        useAddressForPaymentDetails: values.useAddressForPaymentDetails,
        nameOnCard: values.nameOnCard,
        cardNumber: values.cardNumber,
        cvv: values.cvv,
        plan: values.plan,
        price: plan.price,
        users: plan.users,
        connections: plan.connections,
        invoiceId: invoiceId
      }

      const { data } = await api.post("/subscription", newValues);
      setDatePayment(data)
      actions.setSubmitting(false);
      setActiveStep(activeStep + 1);
      toast.success("¡Suscripción completada exitosamente!, pendiente de pago");
    } catch (err) {
      toastError(err);
    }
  }

  function _handleSubmit(values, actions) {
    if (isLastStep) {
      _submitForm(values, actions);
    } else {
      setActiveStep(activeStep + 1);
      actions.setTouched({});
      actions.setSubmitting(false);
    }
  }

  function _handleBack() {
    setActiveStep(activeStep - 1);
  }

  // Función para manejar la redirección a WhatsApp
  function redirectToWhatsApp(values) {
    const plan = JSON.parse(values.plan);
    const message = `¡Hola! Me gustaría realizar el pago para suscribirme al plan ${plan.name} con un precio de ${plan.price} y para ${plan.users} usuarios con ${plan.connections} conexiones.`;
    const phoneNumber = '51999053124'; // Reemplaza con el número de teléfono deseado

    // Construir la URL de redirección con el número de teléfono y el mensaje
    const url = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    // Redirigir a la URL de WhatsApp
    window.location.href = url;
  }

  return (
    <React.Fragment>
      <Typography component="h1" variant="h4" align="center">
        ¡Falta poco!
      </Typography>
      <Stepper activeStep={activeStep} className={classes.stepper}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <React.Fragment>
        {activeStep === steps.length ? (
          <CheckoutSuccess pix={datePayment} />
        ) : (
          <Formik
            initialValues={{
              ...user,
              ...formInitialValues
            }}
            validationSchema={currentValidationSchema}
            onSubmit={_handleSubmit}
          >
            {({ isSubmitting, setFieldValue, values }) => (
              <Form id={formId}>
                {_renderStepContent(activeStep, setFieldValue, setActiveStep, values)}

                <div className={classes.buttons}>
                  {activeStep !== 1 && (
                    <Button onClick={_handleBack} className={classes.button}>
                      Regresar
                    </Button>
                  )}
                  <div className={classes.wrapper}>
                    {activeStep !== 1 && (
                      <Button
                        disabled={isSubmitting}
                        type="button"
                        onClick={() => redirectToWhatsApp(values)} // Llama a la función de redireccionamiento con los valores del formulario
                        variant="contained"
                        color="primary"
                        className={classes.button}
                      >
                        {isLastStep ? "PAGAR" : "PRÓXIMO"}
                      </Button>
                    )}
                    {isSubmitting && (
                      <CircularProgress
                        size={24}
                        className={classes.buttonProgress}
                      />
                    )}
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </React.Fragment>
    </React.Fragment>
  );
}
