import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Invoice } from '@/types';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontFamily: 'Helvetica-Bold',
    },
    companyInfo: {
        textAlign: 'right',
        fontSize: 9,
        lineHeight: 1.5,
    },
    invoiceMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 15,
    },
    labelText: {
        fontSize: 9,
        marginRight: 4,
    },
    billingSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 10,
        marginBottom: 6,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    dottedLine: {
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    table: {
        borderWidth: 1,
        borderColor: '#000',
        marginBottom: 15,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#000',
        backgroundColor: '#f9f9f9',
    },
    tableHeaderText: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 10,
        padding: 5,
        borderRightWidth: 1,
        borderRightColor: '#000',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#000',
    },
    tableCell: {
        padding: 5,
        fontSize: 9,
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#000',
    },
    notesBox: {
        borderWidth: 1,
        borderColor: '#000',
        padding: 5,
        width: '55%',
    },
    totalsBox: {
        width: '35%',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    totalLabel: {
        fontSize: 9,
    },
    totalValue: {
        fontSize: 9,
    },
});

const InvoicePDF = ({ invoice }: { invoice: Invoice }) => {
    const formatCurrency = (n: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Invoice</Text>
                    <View style={styles.companyInfo}>
                        <Text>Your Company Name</Text>
                        <Text>Your Company Address</Text>
                        <Text>City, State Pin</Text>
                    </View>
                </View>

                {/* Invoice Info */}
                <View style={styles.invoiceMeta}>
                    <Text>Invoice No: {invoice.invoiceNumber}</Text>
                    <Text>Date: {new Date(invoice.createdAt).toLocaleDateString()}</Text>
                </View>

                {/* Billing Info */}
                <View style={styles.billingSection}>
                    <Text style={styles.sectionTitle}>BILLING INFORMATION</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.labelText}>Name:</Text>
                        <Text style={styles.dottedLine}>
                            {invoice.customer?.name || ' '}
                        </Text>

                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.labelText}>Address:</Text>
                        <Text style={styles.dottedLine}>
                            {invoice.customer?.address || ' '}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.labelText}>Phone:</Text>
                        <Text style={[styles.dottedLine, { width: '40%' }]}>
                            {invoice.customer?.phone || ' '}
                        </Text>
                        <Text style={[styles.labelText, { marginLeft: 10 }]}>Email:</Text>
                        <Text style={[styles.dottedLine, { width: '40%' }]}>
                            {invoice.customer?.email || ' '}
                        </Text>
                    </View>
                </View>

                {/* Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, { width: '40%' }]}>DESCRIPTION</Text>
                        <Text style={[styles.tableHeaderText, { width: '20%' }]}>QUANTITY</Text>
                        <Text style={[styles.tableHeaderText, { width: '20%' }]}>COST</Text>
                        <Text style={[styles.tableHeaderText, { width: '20%', borderRightWidth: 0 }]}>AMOUNT</Text>
                    </View>

                    {invoice.items.map((item) => (
                        <View style={styles.tableRow} key={item.id}>
                            <Text style={[styles.tableCell, { width: '40%' }]}>{item.description}</Text>
                            <Text style={[styles.tableCell, { width: '20%' }]}>{item.quantity}</Text>
                            <Text style={[styles.tableCell, { width: '20%' }]}>{formatCurrency(item.unitPrice)}</Text>
                            <Text style={[styles.tableCell, { width: '20%', borderRightWidth: 0 }]}>
                                {formatCurrency(item.lineTotal)}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Notes + Totals */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={styles.totalsBox}>
                        <View style={[styles.totalRow, { borderTopWidth: 1, borderTopColor: '#000', marginTop: 4, paddingTop: 4 }]}>
                            <Text style={[styles.totalLabel, { fontFamily: 'Helvetica-Bold' }]}>TOTAL</Text>
                            <Text style={[styles.totalValue, { fontFamily: 'Helvetica-Bold' }]}>
                                {formatCurrency(invoice.totalAmount)}
                            </Text>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default InvoicePDF;
