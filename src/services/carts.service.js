import { cartDao } from "../dao/mongo/cart.dao.js"
import { productDao } from "../dao/mongo/product.dao.js";

class CartsService{

    async create(){
        return await cartDao.create()
    }

    async getById(id){
        return await cartDao.getById(id)
    }

    async addProductToCart(cid, pid){
        const cart = await cartDao.getById(cid)

        const productInCart = cart.products.find((element) => element.product == pid);
        if (productInCart) {
            productInCart.quantity++;
        } else {
            cart.products.push({ product: pid, quantity: 1 });
        }

        return await cartDao.update(cid, {products: cart.products})
    }

    async deleteProductToCart(cid, pid){
            const cart = await cartDao.getById(cid);
            cart.products = cart.products.filter((element) => element.product != pid);
            
            return await cartDao.update(cid, {products: cart.products})
    }

    async updateQuantityProductInCart(cid, pid, quantity) {
        const cart = await cartDao.getById(cid);
        const product = cart.products.find((element) => element.product == pid);
        product.quantity = quantity;
    
        return await cartDao.update(cid, {products: cart.products})
    }

    async clearProductsToCart(cid) {
        return await cartDao.update(cid, {products: []})
    }

    async purchaseCart(cid){
        const cart = await cartDao.getById(cid)

        let total = 0
        const productsWithoutStock = []

        for (const productCart of cart.products) {
            const prod = await productDao.getById(productCart.product)

            if (prod.stock >= productCart.quantity) {
                total += prod.price * productCart.quantity

                await productDao.update(prod._id, {stock: prod.stock - productCart.quantity})
            } else{
                productsWithoutStock.push(productCart)
            }

            await cartDao.update(cid, {products: productsWithoutStock})
        }

        return total
    }
}

export const cartsServices = new CartsService()