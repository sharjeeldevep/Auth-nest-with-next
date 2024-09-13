import mongoose, { FilterQuery, Document } from 'mongoose';
import { IFieldsStructure } from '../types';

export interface Query extends FilterQuery<Document> {
  $or?: Array<FilterQuery<Document>>;
}
export class APIFeatures {
  static filterOne(params) {
    const queryObj = { ...params };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    return JSON.parse(queryStr);
  }

  static filter(params, fieldsStructure: IFieldsStructure) {
    const queryObj = { ...params };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];

    // Remove fields not needed for the query
    excludedFields.forEach((el) => delete queryObj[el]);

    // Convert query object to string and replace with MongoDB operators
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // Parse the modified string back into an object
    const modifiedQueryObj = JSON.parse(queryStr);

    const finalQuery: Query = {};

    // Advanced filtering
    for (const key in modifiedQueryObj) {
      if (
        modifiedQueryObj.hasOwnProperty(key) &&
        !excludedFields.includes(key)
      ) {
        const value = modifiedQueryObj[key];

        // Check if the value contains a comma, indicating a list of values
        if (typeof value === 'string' && value.includes(',')) {
          // Split the value on commas to support arrays of values
          const valuesArray = value.split(',');
          finalQuery[key] = fieldsStructure.stringFields.includes(key)
            ? { $in: valuesArray.map((item) => new RegExp(item, 'i')) }
            : { $in: valuesArray };
        } else if (fieldsStructure.stringFields.includes(key)) {
          // Apply case-insensitive matching for specific fields
          finalQuery[key] = { $regex: new RegExp(value, 'i') };
        } else {
          // For non-case-insensitive fields, assign the value directly
          finalQuery[key] = value;
        }
      }
    }

    // Search functionality
    if (params.search && fieldsStructure.searchFields.length > 0) {
      const searchQuery = params.search;
      finalQuery.$or = [
        ...fieldsStructure.stringFields.map((field) => ({
          [field]: { $regex: new RegExp(searchQuery, 'i') },
        })),
        ...fieldsStructure.numericFields
          .filter(() => !isNaN(searchQuery))
          .map((field) => ({ [field]: Number(searchQuery) })),
        //need to add _id serach here ytoo
        ...fieldsStructure.objectIdFields
          .filter(() => mongoose.isValidObjectId(searchQuery))
          .map((field) => ({
            [field]: new mongoose.Types.ObjectId(searchQuery),
          })),
      ];
    }

    return finalQuery;
  }

  static sort(params) {
    if (params && params.sort) {
      return params.sort.split(',').join(' ');
    } else {
      return '-createdAt';
    }
  }

  static select(params) {
    if (params && params.fields) {
      return params.fields.split(',').join(' ');
    } else {
      return '-__v';
    }
  }

  static populate(params) {
    if (params && params.populateFields) {
      return params.populateFields.split(',');
    }
  }

  static paginate(params) {
    const page = (params && params.page * 1) || 1;
    const limit = (params && params.limit * 1) || 100;
    const skip = (page - 1) * limit;

    return {
      skip,
      limit,
    };
  }
}
