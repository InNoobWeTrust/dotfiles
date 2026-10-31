import React from "react"
import { defineComponent } from "@openuidev/react-lang"
import { z } from "zod/v4"
import { Tile as CarbonTile } from "@carbon/react/es/components/Tile/Tile.js"
import { Heading as CarbonHeading, Section } from "@carbon/react/es/components/Heading/index.js"

export const layoutComponents = [
  defineComponent({
    name: "Page",
    description: "Root page using Carbon White. Compose an ordered array of component references as children.",
    props: z.object({ children: z.array(z.unknown()).describe("Ordered child component references") }),
    component: ({ props, renderNode }) => (
      <Section level={1}>
        <main className="studio-page">
          {props.children.map((child, index) => <React.Fragment key={index}>{renderNode(child)}</React.Fragment>)}
        </main>
      </Section>
    ),
  }),
  defineComponent({
    name: "Stack",
    description: "Arrangement only: stack child component references vertically or in a wrapping row using Carbon spacing.",
    props: z.object({ direction: z.enum(["vertical", "horizontal"]), children: z.array(z.unknown()).describe("Ordered child component references") }),
    component: ({ props, renderNode }) => (
      <div className={"studio-stack studio-stack--" + props.direction}>
        {props.children.map((child, index) => <React.Fragment key={index}>{renderNode(child)}</React.Fragment>)}
      </div>
    ),
  }),
  defineComponent({
    name: "Tile",
    description: "Official noninteractive Carbon Tile containing child component references.",
    props: z.object({ children: z.array(z.unknown()).describe("Ordered child component references") }),
    component: ({ props, renderNode }) => (
      <CarbonTile>
        <div className="studio-stack studio-stack--vertical">
          {props.children.map((child, index) => <React.Fragment key={index}>{renderNode(child)}</React.Fragment>)}
        </div>
      </CarbonTile>
    ),
  }),
  defineComponent({
    name: "Heading",
    description: "Official Carbon semantic heading. Choose level 1 for the page title, then logical section levels.",
    props: z.object({ text: z.string(), level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]) }),
    component: ({ props }) => <Section level={props.level}><CarbonHeading>{props.text}</CarbonHeading></Section>,
  }),
  defineComponent({
    name: "Text",
    description: "Plain paragraph with official Carbon body typography; text only, no HTML or Markdown.",
    props: z.object({ text: z.string() }),
    component: ({ props }) => <p className="studio-text">{props.text}</p>,
  }),
]
