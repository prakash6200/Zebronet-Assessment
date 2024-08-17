module.exports.paginate = async (model, options, page, limit) => {
  try {
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 50;
    options.limit = limit;
    options.offset = page - 1 <= 0 ? 0 : (page - 1) * limit;

    const { count, rows } = await model.findAndCountAll(options);
    lastPage = Math.ceil(count / limit);
    firstPage = 1;
    return {
      total: count,
      page: page,
      limit: limit,
      hasPrevious: page > 1,
      hasNext: page < lastPage,
      previous: page > 1 ? (page - 1 <= lastPage ? page - 1 : lastPage) : null,
      next: page < lastPage ? (page + 1 >= 1 ? page + 1 : 1) : null,
      firstPage: firstPage,
      lastPage: lastPage,
      records: rows,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
