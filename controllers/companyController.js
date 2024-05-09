const Company = require("../models/companyModel");
const moment = require("moment");

// Add a new company stock data
const addCompanyData = async (req, res) => {
    try {
        const {
            name,
            month,
            year,
            close_price,
            open_price,
            volume,
            high_price,
            low_price,
            adjust_close_price,
        } = req.body;

        // Find the company by name
        let company = await Company.findOne({ name });

        if (company) {
            // Find the existing month-year record
            const existingRecord = company.monthlyData.find(
                (data) => data.month === month && data.year === year
            );

            if (existingRecord) {
                // Update existing record
                existingRecord.close_price = close_price;
                existingRecord.open_price = open_price;
                existingRecord.volume = volume;
                existingRecord.high_price = high_price;
                existingRecord.low_price = low_price;
                existingRecord.adjust_close_price = adjust_close_price;
            } else {
                // Add a new month-year record
                company.monthlyData.push({
                    month,
                    year,
                    close_price,
                    open_price,
                    volume,
                    high_price,
                    low_price,
                    adjust_close_price,
                });
            }

            await company.save();
            res.status(200).json({ message: "Company data updated successfully" });
        } else {
            // Create a new company with the month-year data
            company = new Company({
                name,
                monthlyData: [
                    {
                        month,
                        year,
                        close_price,
                        open_price,
                        volume,
                        high_price,
                        low_price,
                        adjust_close_price,
                    },
                ],
            });

            await company.save();
            res.status(200).json({ message: "Company data added successfully" });
        }
    } catch (error) {
        console.error("Error adding or updating company data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get company data by company name
const getCompanyData = async (req, res) => {
    try {
        const { name, month, year } = req.query;

        // Find the company by name
        const company = await Company.findOne({ name: new RegExp(`^${name}$`, "i") });

        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        // Find the data for the specified month and year
        const normalizedMonth = month.toLowerCase();
        const normalizedYear = year.toString().toLowerCase();

        const companyData = company.monthlyData.find(
            (data) =>
                data.month.toLowerCase() === normalizedMonth &&
                data.year.toLowerCase() === normalizedYear
        );

        if (!companyData) {
            return res.status(404).json({ message: "Data for specified month and year not found" });
        }

        // Return the found data
        res.status(200).json({ data: companyData });
    } catch (error) {
        console.error("Error fetching company data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// get current month price
const getCurrentPrice = async (req, res) => {
    try {
        const currentMonth = moment().format("MMMM");
        const currentYear = moment().format("YYYY");

        const companies = await Company.find({
            "monthlyData.month": currentMonth,
            "monthlyData.year": currentYear,
        });

        const closePrices = companies.map((company) => {
            const monthData = company.monthlyData.find(
                (data) => data.month === currentMonth && data.year === currentYear
            );
            return {
                companyName: company.name,
                closePrice: monthData ? monthData.close_price : "No data",
            };
        });

        res.status(200).json({ closePrices });
    } catch (error) {
        console.error("Error fetching close prices:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    addCompanyData,
    getCompanyData,
    getCurrentPrice,
};
