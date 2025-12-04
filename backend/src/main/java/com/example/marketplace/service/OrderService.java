package com.example.marketplace.service;

import com.example.marketplace.domain.common.TargetType;
import com.example.marketplace.domain.demand.Demand;
import com.example.marketplace.domain.item.Item;
import com.example.marketplace.domain.offer.Offer;
import com.example.marketplace.domain.offer.OfferStatus;
import com.example.marketplace.domain.order.Order;
import com.example.marketplace.domain.order.OrderItem;
import com.example.marketplace.domain.order.OrderStatus;
import com.example.marketplace.dto.order.CreateOrderFromOfferRequest;
import com.example.marketplace.dto.order.OrderDetailResponse;
import com.example.marketplace.dto.order.OrderItemSummary;
import com.example.marketplace.exception.BusinessException;
import com.example.marketplace.exception.ErrorCode;
import com.example.marketplace.repository.DemandRepository;
import com.example.marketplace.repository.ItemRepository;
import com.example.marketplace.repository.OfferRepository;
import com.example.marketplace.repository.OrderItemRepository;
import com.example.marketplace.repository.OrderRepository;
import com.example.marketplace.security.AuthenticatedUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OfferRepository offerRepository;
    private final ItemRepository itemRepository;
    private final DemandRepository demandRepository;
    private final AuditService auditService;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        OfferRepository offerRepository,
                        ItemRepository itemRepository,
                        DemandRepository demandRepository,
                        AuditService auditService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.offerRepository = offerRepository;
        this.itemRepository = itemRepository;
        this.demandRepository = demandRepository;
        this.auditService = auditService;
    }

    @Transactional
    public Order createOrderFromOffer(CreateOrderFromOfferRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new BusinessException(ErrorCode.AUTH_REQUIRED, "Authentication required");
        }

        Long offerId = request.getOfferId();
        if (offerId == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "offerId is required");
        }

        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TARGET_NOT_FOUND, "Offer not found"));

        if (offer.getStatus() != OfferStatus.created) {
            throw new BusinessException(ErrorCode.CONFLICT_STATE, "Offer is not in created state");
        }

        TargetType targetType = offer.getTargetType();
        Long targetId = offer.getTargetId();

        Long buyerId;
        Long sellerId;

        if (targetType == TargetType.item) {
            Item item = itemRepository.findById(targetId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.TARGET_NOT_FOUND, "Item not found"));
            if (!item.getStatus().equals("active")) {
                throw new BusinessException(ErrorCode.TARGET_NOT_ACTIVE, "Item is not active");
            }
            sellerId = item.getSellerId();
            buyerId = offer.getOffererId();
        } else if (targetType == TargetType.demand) {
            Demand demand = demandRepository.findById(targetId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.TARGET_NOT_FOUND, "Demand not found"));
            if (!demand.getStatus().equals("active")) {
                throw new BusinessException(ErrorCode.TARGET_NOT_ACTIVE, "Demand is not active");
            }
            buyerId = demand.getBuyerId();
            sellerId = offer.getOffererId();
        } else {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Unsupported offer targetType");
        }

        Long currentUserId = principal.getUserId();
        if (!currentUserId.equals(buyerId) && !currentUserId.equals(sellerId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN_OWNER, "Not participant of this offer");
        }

        BigDecimal amount = offer.getAmount();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(ErrorCode.INVALID_AMOUNT, "Invalid offer amount");
        }

        Order order = new Order();
        order.setBuyerId(buyerId);
        order.setSellerId(sellerId);
        order.setOfferId(offer.getOfferId());
        order.setTotalAmount(amount);
        order.setStatus(OrderStatus.created);
        order.setShippingName(request.getShippingName());
        order.setShippingPhone(request.getShippingPhone());
        order.setShippingAddress(request.getShippingAddress());
        order.setPaymentMethod(request.getPaymentMethod());
        Instant now = Instant.now();
        order.setCreatedAt(now);
        order.setUpdatedAt(now);

        Order savedOrder = orderRepository.save(order);

        OrderItem orderItem = new OrderItem();
        orderItem.setOrderId(savedOrder.getOrderId());
        orderItem.setTargetType(targetType);
        orderItem.setTargetId(targetId);
        orderItem.setQuantity(1);
        orderItem.setPrice(amount);
        orderItem.setCreatedAt(now);
        orderItemRepository.save(orderItem);

        offer.setStatus(OfferStatus.accepted);
        offerRepository.save(offer);

        auditService.auditInfo(currentUserId, "ORDER_CREATE", "ORDER", savedOrder.getOrderId(), "Order created from offer");

        return savedOrder;
    }

    @Transactional(readOnly = true)
    public OrderDetailResponse getOrderDetail(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Order not found"));

        List<OrderItem> items = orderItemRepository.findByOrderId(order.getOrderId());

        OrderDetailResponse resp = new OrderDetailResponse();
        resp.setOrderId(order.getOrderId());
        resp.setBuyerId(order.getBuyerId());
        resp.setSellerId(order.getSellerId());
        resp.setOfferId(order.getOfferId());
        resp.setTotalAmount(order.getTotalAmount());
        resp.setStatus(order.getStatus().name());
        resp.setShippingName(order.getShippingName());
        resp.setShippingPhone(order.getShippingPhone());
        resp.setShippingAddress(order.getShippingAddress());
        resp.setPaymentMethod(order.getPaymentMethod());
        resp.setCreatedAt(order.getCreatedAt());
        resp.setUpdatedAt(order.getUpdatedAt());

        List<OrderItemSummary> itemDtos = items.stream().map(oi -> {
            OrderItemSummary s = new OrderItemSummary();
            s.setOrderItemId(oi.getOrderItemId());
            s.setTargetType(oi.getTargetType().name());
            s.setTargetId(oi.getTargetId());
            s.setQuantity(oi.getQuantity());
            s.setPrice(oi.getPrice());
            return s;
        }).collect(Collectors.toList());

        resp.setItems(itemDtos);
        return resp;
    }
}
