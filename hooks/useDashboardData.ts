import { getCustomerCount } from "@/lib/customers"
import { getInvoices } from "@/lib/invoices"
import { getProductsCount } from "@/lib/products"
import { Invoice } from "@/types"
import { useEffect, useState } from "react"

const useDashboardData = () => {
    const [customerCount, setCustomerCount] = useState(0)
    const [invoicesData, setInvoicesData] = useState<Invoice[]>([])
    const [productsCount, setProductsCount] = useState(0)
    const [revenueMonth, setRevenueMonth] = useState(0)

    // for line chart
    const [monthlyRevenueData, setMonthlyRevenue] = useState<
        { month: string; revenue: number }[]
    >([])
    const fetchCustomerCount = async () => {
        try {
            const count = await getCustomerCount()
            setCustomerCount(count)
        } catch (error) {
            console.error("Error fetching customer count:", error)
        }
    }

    const fetchInvoices = async () => {
        try {
            const data = await getInvoices()
            const total = data.filter(invoice => invoice.status === 'PAID').reduce((sum, invoice) => sum + Number(invoice.totalAmount), 0)
            console.log("Monthly Revenue:", total, typeof total)
            setRevenueMonth(total)
            setInvoicesData(data)
        } catch (error) {
            console.error("Error fetching invoices:", error)
        }
    }

    const fetchProductsCount = async () => {
        try {
            const count = await getProductsCount()
            setProductsCount(count)
        } catch (error) {
            console.error("Error fetching products count:", error)
        }
    }



    useEffect(() => {
        fetchCustomerCount()
        fetchInvoices()
        fetchProductsCount()
    }, [])

useEffect(() => {
    const calculateMonthlyRevenue = () => {
        const monthlyData = Array(12).fill(0)
        invoicesData.forEach(invoice => {
            const month = new Date(invoice.createdAt).getMonth()
            if (invoice.status === 'PAID') {
                monthlyData[month] += Number(invoice.totalAmount)
            }
        })
        
        // Transform into the format Recharts expects
        const chartData = monthlyData.map((revenue, index) => ({
            month: new Date(0, index).toLocaleString('default', { month: 'long' }),
            revenue: Number(revenue)
        }))
        
        setMonthlyRevenue(chartData)
    }
    calculateMonthlyRevenue()
}, [invoicesData])

    return {
        customerCount,
        invoicesData,
        productsCount,
        revenueMonth,
        monthlyRevenueData
    }
}

export default useDashboardData