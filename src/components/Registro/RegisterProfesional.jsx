"use client";
import { useRouter } from "next/navigation";
import { Form, Formik } from "formik";
import { InputsFormRegister } from "./InputsForms";
import { axiosRegisterProfessionalForm } from "@/services/users";
import { getFormdataFromObj, removeObjFalsyValues } from "@/utils/helpers";
import { formikZodValidator } from "@/utils/validations";
import {
  professionalInitialValues,
  professionalSchema,
} from "@/utils/validations/professionalSchema";
import { listInputsUser } from "./listInputs";
import toast from "react-hot-toast";

export function RegisterProfessional({
  conditionsAccepted,
  aceptoCondiciones,
  setAceptoCondiciones,
  recibirInformacion,
  setRecibirInformacion,
}) {
  const router = useRouter();

  const handleSubmitRegister = async (values, { resetForm }) => {
    if (!conditionsAccepted) {
      toast.error("Por favor acepte los términos y condiciones");
      return;
    }

    // Preservar lat/lng antes de eliminar valores falsy (0 es falsy en JS)
    const { latitude, longitude } = values;
    values = removeObjFalsyValues(values);
    const formData = getFormdataFromObj(values);
    // set() sobrescribe si ya existe o crea la entrada, garantizando un único valor por campo
    if (latitude != null) formData.set("latitude", latitude);
    if (longitude != null) formData.set("longitude", longitude);

    try {
      // Esperar a que el registro se complete
      await axiosRegisterProfessionalForm(formData);

      // Si llegamos aquí, el registro fue exitoso
      resetForm();

      // Esperar un poco para que el toast de éxito se muestre antes de redirigir
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      // El error ya fue manejado por el toast.promise, 
      // pero capturamos aquí para evitar que se lance una excepción sin manejo
      console.error("Error en registro profesional:", error);
    }
  };

  return (
    <Formik
      onSubmit={handleSubmitRegister}
      initialValues={professionalInitialValues}
      validate={formikZodValidator(professionalSchema)}
    >
      <Form className="flex flex-col gap-2 w-full">
        <InputsFormRegister
          isProfessional={true}
          submitButtonMessage={"Crear perfil"}
          listInputsValue={listInputsUser}
          aceptoCondiciones={aceptoCondiciones}
          setAceptoCondiciones={setAceptoCondiciones}
          recibirInformacion={recibirInformacion}
          setRecibirInformacion={setRecibirInformacion}
        />
      </Form>
    </Formik>
  );
}
