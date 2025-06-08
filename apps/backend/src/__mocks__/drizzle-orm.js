module.exports = {
  drizzle: jest.fn(() => ({
    // Mock drizzle instance
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
};
