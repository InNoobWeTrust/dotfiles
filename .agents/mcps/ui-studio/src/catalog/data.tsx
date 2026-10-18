import React from "react"
import { defineComponent } from "@openuidev/react-lang"
import { z } from "zod/v4"
import CarbonTag from "@carbon/react/es/components/Tag/Tag.js"
import { InlineNotification as CarbonInlineNotification } from "@carbon/react/es/components/Notification/Notification.js"
import { Tabs as CarbonTabs, TabList, Tab, TabPanels, TabPanel } from "@carbon/react/es/components/Tabs/Tabs.js"
import CarbonTable from "@carbon/react/es/components/DataTable/Table.js"
import TableHead from "@carbon/react/es/components/DataTable/TableHead.js"
import TableBody from "@carbon/react/es/components/DataTable/TableBody.js"
import TableRow from "@carbon/react/es/components/DataTable/TableRow.js"
import TableHeader from "@carbon/react/es/components/DataTable/TableHeader.js"
import TableCell from "@carbon/react/es/components/DataTable/TableCell.js"

export const dataComponents = [
  defineComponent({
    name: "Tag",
    description: "Official Carbon read-only tag, not an interactive filter.",
    props: z.object({ text: z.string(), type: z.enum(["gray", "blue", "green", "red", "purple", "teal"]) }),
    component: ({ props }) => <CarbonTag type={props.type}>{props.text}</CarbonTag>,
  }),
  defineComponent({
    name: "InlineNotification",
    description: "Official Carbon inline notification, kept visible without a dismiss action.",
    props: z.object({ title: z.string(), subtitle: z.string(), kind: z.enum(["info", "success", "warning", "error"]) }),
    component: ({ props }) => <CarbonInlineNotification title={props.title} subtitle={props.subtitle} kind={props.kind} hideCloseButton lowContrast />,
  }),
  defineComponent({
    name: "Tabs",
    description: "Official Carbon keyboard-operable tabs and panels. Each content is a component reference. At least one tab is required.",
    props: z.object({ label: z.string(), tabs: z.array(z.object({ label: z.string(), content: z.unknown().describe("Panel component reference") })).min(1) }),
    component: ({ props, renderNode }) => (
      <CarbonTabs>
        <TabList aria-label={props.label}>
          {props.tabs.map((tab, index) => <Tab key={index}>{tab.label}</Tab>)}
        </TabList>
        <TabPanels>
          {props.tabs.map((tab, index) => <TabPanel key={index}>{renderNode(tab.content)}</TabPanel>)}
        </TabPanels>
      </CarbonTabs>
    ),
  }),
  defineComponent({
    name: "Table",
    description: "Official Carbon semantic table with caption and column headers. Each row must contain one plain-text cell per column. No sorting, fetching, or charts.",
    props: z.object({ caption: z.string(), columns: z.array(z.string()).min(1), rows: z.array(z.array(z.string())), zebra: z.boolean() }),
    component: ({ props }) => (
      <div className="studio-table-scroll">
        <CarbonTable size="md" useZebraStyles={props.zebra}>
          <caption>{props.caption}</caption>
          <TableHead>
            <TableRow>
              {props.columns.map((column, index) => <TableHeader key={index} scope="col">{column}</TableHeader>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {props.rows.map((row, index) => (
              <TableRow key={index}>
                {row.map((cell, column) => <TableCell key={column}>{cell}</TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </CarbonTable>
      </div>
    ),
  }),
]
