import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '../../modules/order/order.service';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { OrderStatus, OrderSide, OrderType } from '../../common/enums/order.enums';
import { AppModule } from '../../app.module';

describe('OrderController', () => {
  let app: INestApplication;
  let orderService = {
    createOrder: jest.fn(),
    getOrder: jest.fn(),
    getOrders: jest.fn(),
    updateOrder: jest.fn(),
    cancelOrder: jest.fn(),
    processLimitBuyOrder: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider(OrderService)
      .useValue(orderService)
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('should create a new order', async () => {
    const createOrderDto = {
      instrumentId: 1,
      userId: 1,
      side: OrderSide.BUY,
      size: 100,
      price: 10.5,
      type: OrderType.LIMIT,
    };

    orderService.createOrder.mockResolvedValue({ id: 1, ...createOrderDto });

    const response = await request(app.getHttpServer())
      .post('/api/order')
      .send(createOrderDto)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.userId).toBe(createOrderDto.userId);
    expect(response.body.price).toBe(createOrderDto.price);
  });

  it('should get a single order by ID', async () => {
    const orderId = 1;
    const mockOrder = {
      id: 1,
      instrumentId: 1,
      userId: 1,
      side: OrderSide.BUY,
      size: 100,
      price: 10.5,
      type: OrderType.LIMIT,
    };

    orderService.getOrder.mockResolvedValue(mockOrder);

    const response = await request(app.getHttpServer())
      .get(`/api/order/${orderId}`)
      .expect(200);

    expect(response.body).toEqual(mockOrder);
  });

  it('should get all orders for a user', async () => {
    const userId = 1;
    const mockOrders = [
      {
        id: 1,
        instrumentId: 1,
        userId: 1,
        side: OrderSide.BUY,
        size: 100,
        price: 10.5,
        type: OrderType.LIMIT,
      },
      {
        id: 2,
        instrumentId: 2,
        userId: 1,
        side: OrderSide.SELL,
        size: 200,
        price: 15.0,
        type: OrderType.LIMIT,
      },
    ];

    orderService.getOrders.mockResolvedValue({
      data: mockOrders,
      meta: {
        totalItems: 2,
        itemCount: 2,
        totalPages: 1,
        currentPage: 1,
      },
    });

    const response = await request(app.getHttpServer())
      .get(`/api/order`)
      .query({ userId, page: 1, limit: 10 })
      .expect(200);

    expect(response.body.data).toEqual(mockOrders);
    expect(response.body.meta.totalItems).toBe(2);
    expect(response.body.meta.currentPage).toBe(1);
  });

  it('should process a LIMIT BUY order', async () => {
    const orderId = 1;
    const mockOrder = {
      id: 1,
      instrumentId: 1,
      userId: 1,
      side: OrderSide.BUY,
      size: 100,
      price: 10.5,
      type: OrderType.LIMIT,
      status: OrderStatus.NEW,
    };

    orderService.getOrder.mockResolvedValue(mockOrder);
    orderService.processLimitBuyOrder.mockResolvedValue({
      message: 'Orden procesada exitosamente',
      orderId: mockOrder.id,
      status: OrderStatus.FILLED,
    });

    const response = await request(app.getHttpServer())
      .patch(`/api/order/process/${orderId}`)
      .expect(200);

    expect(response.body.message).toBe('Orden procesada exitosamente');
    expect(response.body.status).toBe(OrderStatus.FILLED);
  });

  it('should cancel an order', async () => {
    const orderId = 1;
    const mockOrder = {
      id: 1,
      instrumentId: 1,
      userId: 1,
      side: OrderSide.BUY,
      size: 100,
      price: 10.5,
      type: OrderType.LIMIT,
      status: OrderStatus.NEW,
    };

    orderService.getOrder.mockResolvedValue(mockOrder);
    orderService.cancelOrder.mockResolvedValue({
      ...mockOrder,
      status: OrderStatus.CANCELLED,
    });

    const response = await request(app.getHttpServer())
      .patch(`/api/order/cancel/${orderId}`)
      .expect(200);

    expect(response.body.status).toBe(OrderStatus.CANCELLED);
  });

  afterAll(async () => {
    await app.close();
  });
});
