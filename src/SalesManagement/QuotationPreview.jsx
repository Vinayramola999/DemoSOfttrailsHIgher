import React from "react";

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { toWords } from "number-to-words";

// ✅ Register font
Font.register({
  family: "Helvetica",
  fonts: [{ src: "https://fonts.gstatic.com/s/helvetica.ttf" }],
});

// ✅ Styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#fff",
    padding: 20,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    alignItems: "flex-start",
  },
  logo: {
    width: 100,
    height: 50,
    objectFit: "contain",
  },
  header: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1d4ed8",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  label: {
    fontWeight: "bold",
  },
  boxContainer: {
    flexDirection: "row",
    marginVertical: 15,
    gap: 10,
  },
  box: {
    flex: 1,
    backgroundColor: "#f0f8ff",
    padding: 10,
    borderRadius: 4,
  },
  boxTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1d4ed8",
    marginBottom: 4,
    textAlign: "right",
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#1d4ed8",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1d4ed8",
    color: "#fff",
  },
  tableHeaderCell: {
    flex: 1,
    padding: 5,
    fontWeight: "bold",
    fontSize: 9,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tableCell: {
    flex: 1,
    padding: 5,
    fontSize: 9,
    textAlign: "center",
  },
  footer: {
    marginTop: 10,
    alignItems: "flex-end",
  },
  footerText: {
    fontSize: 9,
    marginBottom: 2,
  },
  totalInWords: {
    fontSize: 8,
    fontStyle: "italic",
    marginTop: 3,
    color: "gray",
  },
});

const QuotationPDF = ({ quotationData }) => {

  // Support both API and frontend (local) data structures
  let quotation = quotationData?.quotation;
  let from = quotationData?.quotation_from;
  let to = quotationData?.quotation_for;
  let items = quotationData?.items;
  let companyLogo = quotationData?.company_logo;

  // If not present, fallback to root-level fields (frontend data)
  if (!quotation) quotation = quotationData;
  if (!from) from = quotationData?.from || quotationData?.quotation_from;
  if (!to) to = quotationData?.to || quotationData?.quotation_for;
  if (!items) items = quotationData?.items;
  if (!companyLogo) companyLogo = quotationData?.company_logo;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Logo */}
        <View style={styles.headerContainer}>
          <View>
             {companyLogo && <Image style={styles.logo} src={companyLogo} />}
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.header}>Quotation Preview</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View>
            <Text>
              <Text style={styles.label}>Quotation No: </Text>
              {quotationData?.quotation_no || quotation?.quotation_no || "--"}
            </Text>
            <Text>
              <Text style={styles.label}>Quotation Date: </Text>
              {(quotationData?.quotation_date || quotation?.quotation_date)
                ? new Date(quotationData?.quotation_date || quotation?.quotation_date).toISOString().split("T")[0]
                : "--"}
            </Text>
            <Text>
              <Text style={styles.label}>Validity Date: </Text>
              {quotation?.validity_date
                ? new Date(quotation.validity_date).toISOString().split("T")[0]
                : "--"}
            </Text>
          </View>
          <View>
            <Text>
              <Text style={styles.label}>RFP ID: </Text>
              {quotation?.rfp_id || "--"}
            </Text>
            <Text>
              <Text style={styles.label}>Status: </Text>
              {quotation?.status || "--"}
            </Text>
          </View>
        </View>

        {/* Quotation From / For */}
        <View style={styles.boxContainer}>
          <View style={styles.box}>
            <Text style={styles.boxTitle}>Quotation From</Text>
            <Text>{from?.business_name || ""}</Text>
            <Text>{from?.address || ""}</Text>
            <Text>{from?.city || ""}</Text>
            <Text>GSTIN - {from?.gstin || "--"}</Text>
            <Text>PAN - {from?.pan || "--"}</Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.boxTitle}>Quotation For</Text>
            <Text>{to?.customer_name || "--"}</Text>
            <Text>{to?.address || ""}</Text>
            <Text>GSTIN - {to?.gstin || "--"}</Text>
            <Text>PAN - {to?.pan || "--"}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Item</Text>
            <Text style={styles.tableHeaderCell}>Quantity</Text>
            <Text style={styles.tableHeaderCell}>Unit Rate</Text>
            <Text style={styles.tableHeaderCell}>HSN / SAC</Text>
            <Text style={styles.tableHeaderCell}>Tax (%)</Text>
            <Text style={styles.tableHeaderCell}>Amount</Text>
          </View>
          {items?.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.tableCell}>{item.item_name}</Text>
              <Text style={styles.tableCell}>{item.quantity}</Text>
              <Text style={styles.tableCell}>₹{item.unit_rate}</Text>
              <Text style={styles.tableCell}>{item.hsn_sac || "--"}</Text>
              <Text style={styles.tableCell}>{item.tax_percent}%</Text>
              <Text style={styles.tableCell}>₹{item.amount}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            <Text style={styles.label}>Taxable Amount: </Text>₹
            {quotation?.total_taxable || "0.00"}
          </Text>
          <Text style={styles.footerText}>
            <Text style={styles.label}>Total Amount (INR): </Text>₹
            {quotation?.total_amount || "0.00"}
          </Text>
          <Text style={styles.totalInWords}>
            Total in words:{" "}
            {toWords(Number(quotation?.total_amount || 0))} rupees only
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default QuotationPDF;

