import { productDao } from "../dao/mongo/product.dao.js";

//capa de logica de negocio
class ProductsServices{

    async getAll(query, options){
        return await productDao.getAll(query, options)
    }

    async getById(id){
        return await productDao.getById(id)
    }

    async deleteOne(id){
        return await productDao.deleteOne(id)
    }

    async update(id, data){
        return await productDao.update(id, data)
    }

    async create(data){
        return await productDao.create(data)
    }
}

export const productsServices = new ProductsServices()