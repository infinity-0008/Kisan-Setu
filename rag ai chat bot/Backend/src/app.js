const express = require('express');
const cors = require('cors');
const Sale = require('./models/Sale');
const Mandi = require('./models/Mandi');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/sales', async (req, res) => {
	try {
		const { farmerId, productId, productName, quantity, buyerName, amount, saleDate } = req.body;
		const sale = new Sale({ farmerId, productId, productName, quantity, buyerName, amount, saleDate });
		const createdSale = await sale.save();
		res.status(201).json(createdSale);
	} catch (error) {
		res.status(400).json({
			message: 'Could not create sale',
			error: error.message
		});
	}
});

app.get("/sales", async (req, res) => {
    try {
        const farmerId = req.query.farmerId;
        const productId = req.query.productId;
        const year = req.query.year;
        if (!farmerId) {
            return res.status(400).json({
                message: "farmerId is required"
            });
        }
        let sales;
        // 1. Farmer + Product + Year
        if (productId && year) {
            const yearNumber = Number(year);
            if (!Number.isInteger(yearNumber) || yearNumber < 1) {
                return res.status(400).json({
                    message: "Year must be a valid positive number"
                });
            }
            const startDate = new Date(yearNumber, 0, 1);
            const endDate = new Date(yearNumber + 1, 0, 1);
            sales = await Sale.find({
                farmerId: farmerId,
                productId: productId,
                saleDate: {
                    $gte: startDate,
                    $lt: endDate
                }
            });
        }

        // 2. Farmer + Product
        else if (productId) {
            sales = await Sale.find({
                farmerId: farmerId,
                productId: productId
            });
        }

        // 3. Farmer + Year
        else if (year) {
            const yearNumber = Number(year);
            if (!Number.isInteger(yearNumber) || yearNumber < 1) {
                return res.status(400).json({
                    message: "Year must be a valid positive number"
                });
            }
            const startDate = new Date(yearNumber, 0, 1);
            const endDate = new Date(yearNumber + 1, 0, 1);
            sales = await Sale.find({
                farmerId: farmerId,
                saleDate: {
                    $gte: startDate,
                    $lt: endDate
                }
            });

        }

        // 4. Farmer only
        else {
            sales = await Sale.find({
                farmerId: farmerId
            });

        }
        res.json(sales);
    } catch (error) {

        res.status(500).json({
            message: "Could not retrieve sales",
            error: error.message
        });

    }

});


app.post('/mandis', async (req, res) => {
	try {
		const mandi = new Mandi(req.body);
		const createdMandi = await mandi.save();
		res.status(201).json(createdMandi);
	} catch (error) {
		res.status(400).json({
			message: 'Could not create mandi',
			error: error.message
		});
	}
});

app.get('/mandis', async (req, res) => {
	try {
		const search = req.query.search?.trim();
		if (!search) {
			const mandis = await Mandi.find();
			return res.json(mandis);
		}
		const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const searchRegex = new RegExp(escapedSearch, 'i');
		const mandis = await Mandi.find({
			$or: [
				{ name: searchRegex },
				{ location: searchRegex },
				{ district: searchRegex },
				{ 'products.name': searchRegex }
			]
		});

		if (mandis.length === 0) {
			return res.json({
				message: 'No matching mandis or products were found',
				mandis: [],
				bestPrice: null
			});
		}

		const matchingMandis = mandis.map((mandi) => {
			const mandiMatchesSearch = searchRegex.test(mandi.name)
				|| searchRegex.test(mandi.location)
				|| searchRegex.test(mandi.district);
			const matchingProducts = mandi.products.filter((product) =>
				searchRegex.test(product.name)
			);

			return {
				...mandi.toObject(),
				products: mandiMatchesSearch ? mandi.products : matchingProducts
			};
		});

		const allMatchingProducts = matchingMandis.flatMap((mandi) =>
			mandi.products.map((product) => ({
				productName: product.name,
				price: product.price,
				unit: product.unit,
				mandiName: mandi.name
			}))
		);
		const bestPrice = allMatchingProducts.length > 0
			? allMatchingProducts.reduce((lowest, product) =>
				product.price < lowest.price ? product : lowest
			)
			: null;

		res.json({
			mandis: matchingMandis,
			bestPrice
		});
	} catch (error) {
		res.status(500).json({
			message: 'Could not retrieve mandis',
			error: error.message
		});
	}
});

app.get('/mandis/:id', async (req, res) => {
	try {
		const mandi = await Mandi.findById(req.params.id);
		if (!mandi) {
			return res.status(404).json({
				message: 'Mandi not found'
			});
		}

		res.json(mandi);
	} catch (error) {
		res.status(400).json({
			message: 'Could not retrieve mandi',
			error: error.message
		});
	}
});

app.patch('/mandis/:mandiId/products/:productId', async (req, res) => {
	try {
		const { name, price, unit } = req.body;
		if (!name || price === undefined || !unit) {
			return res.status(400).json({
				message: 'Please provide name, price, and unit to update the product'
			});
		}

		const mandi = await Mandi.findById(req.params.mandiId);
		if (!mandi) {
			return res.status(404).json({
				message: 'Mandi not found'
			});
		}

		const product = mandi.products.id(req.params.productId);
		if (!product) {
			return res.status(404).json({
				message: 'Product listing not found'
			});
		}

		product.name = name;
		product.price = price;
		product.unit = unit;
		await mandi.save();

		res.json({
			message: 'Product listing updated successfully',
			product,
			mandi
		});
	} catch (error) {
		res.status(400).json({
			message: 'Could not update product listing',
			error: error.message
		});
	}
});

app.delete('/mandis/:mandiId/products/:productId', async (req, res) => {
	try {
		const mandi = await Mandi.findById(req.params.mandiId);
		if (!mandi) {
			return res.status(404).json({
				message: 'Mandi not found'
			});
		}

		const product = mandi.products.id(req.params.productId);
		if (!product) {
			return res.status(404).json({
				message: 'Product listing not found'
			});
		}
		product.deleteOne();
		await mandi.save();

		res.json({
			message: 'Product listing deleted successfully',
			mandi
		});
	} catch (error) {
		res.status(400).json({
			message: 'Could not delete product listing',
			error: error.message
		});
	}
});

module.exports = app;
