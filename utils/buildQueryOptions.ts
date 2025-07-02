import { FindManyOptions, FindOptionsWhere, Like, Or } from 'typeorm';
import { BaseQueryParamsDto } from '../src/database/dtos/BasicQueryParams.dto';

interface BuildQueryOptionsArgs<T> {
  queryParams: BaseQueryParamsDto;
  // entityName: string; // e.g., 'job', 'jobSeeker', 'application'
  searchFields?: string[]; // Array of dot-separated paths for searchable fields (e.g., ['job.title', 'job.description'])
  initialWhere?: FindOptionsWhere<T> | FindOptionsWhere<T>[];// Any initial mandatory where conditions
  defaultOrder?: FindManyOptions<T>['order']; // Default order if not specified
}

/**
 * Builds TypeORM FindManyOptions from common query parameters.
 * Handles pagination (skip/take) and search (Like/Or across specified fields).
 *
 * @param args - Configuration for building query options.
 * @returns TypeORM FindManyOptions object.
 */
export function buildQueryOptions<T>(args: BuildQueryOptionsArgs<T>): FindManyOptions<T> {
  const { queryParams, searchFields = [], initialWhere, defaultOrder } = args;
  const { page = 1, per_page = 10, search } = queryParams;

  const skip = (page - 1) * per_page;
  const take = per_page;

  // Start with the mandatory initialWhere condition(s)
  let finalWhere: FindOptionsWhere<T> | FindOptionsWhere<T>[] = initialWhere || {};

  // If a search term is provided, build dynamic search conditions
  if (search && searchFields.length > 0) {
    const searchTerm = `%${search}%`; // For LIKE operator

    // Create a separate condition for each search field
    const individualSearchConditions: FindOptionsWhere<T>[] = searchFields.map(fieldPath => {
      const parts = fieldPath.split('.');
      let condition: FindOptionsWhere<T> = {};
      let currentLevel: any = condition;

      // Dynamically build the nested object for the WHERE clause
      // e.g., for 'job.title', creates { job: { title: Like(...) } }
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1) {
          currentLevel[part] = Like(searchTerm); // Apply Like to the last field
        } else {
          currentLevel[part] = {};
          currentLevel = currentLevel[part]; // Go deeper into the nested object
        }
      }
      return condition;
    });

    // Combine initialWhere (ANDed) with each individual search condition (ORed together)
    const combinedConditionsWithInitialWhere: FindOptionsWhere<T>[] = individualSearchConditions.map(searchCond => {
      // This correctly creates an AND condition between initialWhere and each search field.
      // If initialWhere is an array, this requires more complex merging, but for a single object, this is correct.
      return { ...(initialWhere as FindOptionsWhere<T>), ...searchCond };
    });

    // TypeORM interprets an array of FindOptionsWhere objects as an OR condition.
    finalWhere = combinedConditionsWithInitialWhere;
  }

  // RETURN the constructed FindManyOptions object
  return {
    where: finalWhere,
    skip: skip,
    take: take,
    order: defaultOrder,
  };
}