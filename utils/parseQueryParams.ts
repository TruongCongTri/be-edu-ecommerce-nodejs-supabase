import { QueryDTO } from "../src/app/validators/general.validator";
export const parseQueryParams = (query: Partial<QueryDTO>) => {
  const search = query.search ?? "";
  const page = query.page ?? 1;
  const per_page = query.per_page ?? 5;

  const skip = (page - 1) * per_page;
  const take = per_page;

  return {
    search,
    page,
    per_page,
    skip,
    take,
  };
};
