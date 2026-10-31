import React, { useId } from "react"
import { defineComponent, useTriggerAction } from "@openuidev/react-lang"
import { z } from "zod/v4"
import CarbonButton from "@carbon/react/es/components/Button/Button.js"
import CarbonTextInput from "@carbon/react/es/components/TextInput/TextInput.js"
import CarbonSelect from "@carbon/react/es/components/Select/Select.js"
import CarbonCheckbox from "@carbon/react/es/components/Checkbox/Checkbox.js"

export const inputComponents = [
  defineComponent({
    name: "Button",
    description: "Official Carbon button. Clicking emits only the supplied mock action message; never invokes tools or real application actions.",
    props: z.object({ label: z.string(), action: z.string(), kind: z.enum(["primary", "secondary", "tertiary", "ghost", "danger"]), disabled: z.boolean() }),
    component: ({ props }) => {
      const trigger = useTriggerAction()
      return <CarbonButton type="button" kind={props.kind} disabled={props.disabled} onClick={() => trigger(props.action)}>{props.label}</CarbonButton>
    },
  }),
  defineComponent({
    name: "TextInput",
    description: "Official labeled Carbon text input. Edits are disposable local preview state, not persisted or submitted.",
    props: z.object({ label: z.string(), value: z.string(), placeholder: z.string(), helperText: z.string(), disabled: z.boolean(), invalid: z.boolean(), invalidText: z.string() }),
    component: ({ props }) => {
      const id = useId()
      return <CarbonTextInput
        id={id} labelText={props.label} defaultValue={props.value}
        placeholder={props.placeholder} helperText={props.helperText}
        disabled={props.disabled} invalid={props.invalid} invalidText={props.invalidText}
      />
    },
  }),
  defineComponent({
    name: "Select",
    description: "Official labeled Carbon Select with native options. Selection is disposable preview state. value must match an option value.",
    props: z.object({ label: z.string(), value: z.string(), options: z.array(z.object({ value: z.string(), label: z.string() })), helperText: z.string(), disabled: z.boolean() }),
    component: ({ props }) => {
      const id = useId()
      return (
        <CarbonSelect id={id} labelText={props.label} defaultValue={props.value} helperText={props.helperText} disabled={props.disabled}>
          {props.options.map((option, index) => <option key={index} value={option.value}>{option.label}</option>)}
        </CarbonSelect>
      )
    },
  }),
  defineComponent({
    name: "Checkbox",
    description: "Official labeled Carbon checkbox. Checked state is disposable local preview state.",
    props: z.object({ label: z.string(), checked: z.boolean(), disabled: z.boolean() }),
    component: ({ props }) => {
      const id = useId()
      return <CarbonCheckbox id={id} labelText={props.label} defaultChecked={props.checked} disabled={props.disabled} />
    },
  }),
]
