// utils/buildPaginationMeta.ts
export const buildPaginationMeta = ({
  page,
  per_page,
  total,
}: {
  page: number;
  per_page: number;
  total: number;
}) => {
  const total_page = Math.ceil(total / per_page);

  return {
    current_page: page,
    per_page,
    total,
    total_page,
  };
};
