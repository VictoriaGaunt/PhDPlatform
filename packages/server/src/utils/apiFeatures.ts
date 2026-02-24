import { FilterQuery } from 'mongoose';

interface QueryString {
    page?: string;
    limit?: string;
    sort?: string;
    fields?: string;

    [key: string]: any;
}

/**
 * Класс для построения запросов к MongoDB из query-параметров.
 * Пример: ?page=2&limit=10&sort=-population&federalDistrict=Центральный
 */
export class APIFeatures<T> {
    public query: FilterQuery<T> = {};
    public pagination: { page: number; limit: number; skip: number } = { page: 1, limit: 10, skip: 0 };
    public sort: string = '-createdAt'; // по умолчанию
    public fields: string = '';

    constructor(public queryString: QueryString) {}

    /**
     * Фильтрация – исключаем служебные параметры и преобразуем операторы (gte, gt, lte, lt)
     */
    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'limit', 'sort', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        // Продвинутая фильтрация: замена операторов (gte, gt, lte, lt) на $gte, $gt, $lte, $lt
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        this.query = JSON.parse(queryStr);

        return this;
    }

    /**
     * Сортировка
     */
    sortBy() {
        if (this.queryString.sort) {
            this.sort = this.queryString.sort.split(',').join(' ');
        }
        return this;
    }

    /**
     * Ограничение полей (проекция)
     */
    limitFields() {
        if (this.queryString.fields) {
            this.fields = this.queryString.fields.split(',').join(' ');
        }

        return this;
    }

    /**
     * Пагинация
     */
    paginate() {
        const page = parseInt(this.queryString.page || '1', 10);
        const limit = parseInt(this.queryString.limit || '10', 10);
        const skip = (page - 1) * limit;

        this.pagination = { page, limit, skip };
        return this;
    }

/**
 * Применить все шаги и вернуть объект для mongoose
 */
build() {
    this.filter().sortBy().limitFields().paginate();
    return {
        filter: this.query,
        sort: this.sort,
        fields: this.fields,
        skip: this.pagination.skip,
        limit: this.pagination.limit,
    };
}
}