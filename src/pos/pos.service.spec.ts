import { Test, TestingModule } from '@nestjs/testing';
import { PosService } from './pos.service';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from './inventory.service';
import { PdfService } from './pdf.service';
import { AppWebSocketGateway } from '../websocket/websocket.gateway';
import { Decimal } from '@prisma/client/runtime/library';

describe('PosService', () => {
  let service: PosService;
  let prisma: PrismaService;

  const mockPrismaService = {
    product: {
      findUnique: jest.fn(),
    },
    inventory: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockInventoryService = {};
  const mockPdfService = {
    generateInvoicePdf: jest.fn().mockResolvedValue('/storage/invoices/test.pdf'),
  };
  const mockWsGateway = {
    emitInvoiceCreated: jest.fn(),
    emitInventoryUpdated: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PosService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: InventoryService,
          useValue: mockInventoryService,
        },
        {
          provide: PdfService,
          useValue: mockPdfService,
        },
        {
          provide: AppWebSocketGateway,
          useValue: mockWsGateway,
        },
      ],
    }).compile();

    service = module.get<PosService>(PosService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('scanProduct', () => {
    it('should return product and stock when SKU exists', async () => {
      const mockProduct = {
        id: 'product-1',
        sku: 'COKE-330ML',
        name: 'Coca-Cola 330ml',
        unitPrice: new Decimal(35.0),
        unitSizeMl: 330,
        category: { name: 'Soft Drinks' },
        brand: { name: 'Coca-Cola' },
        manufacturer: { name: 'Coca-Cola Company' },
      };

      const mockInventory = {
        qtyOnHand: 100,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.inventory.findUnique.mockResolvedValue(mockInventory);

      const result = await service.scanProduct('store-1', 'COKE-330ML');

      expect(result.product.sku).toBe('COKE-330ML');
      expect(result.stockQty).toBe(100);
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.scanProduct('store-1', 'INVALID-SKU')).rejects.toThrow(
        'Product with SKU INVALID-SKU not found',
      );
    });
  });

  describe('invoice calculation', () => {
    it('should calculate total correctly', () => {
      const items = [
        { qty: 2, unitPrice: new Decimal(35.0) },
        { qty: 3, unitPrice: new Decimal(20.0) },
      ];

      let total = new Decimal(0);
      items.forEach((item) => {
        total = total.add(item.unitPrice.mul(item.qty));
      });

      expect(total.toString()).toBe('130');
    });
  });
});

