package com.example.marketplace.chat;

import com.example.marketplace.BaseIntegrationTest;
import com.example.marketplace.domain.message.Message;
import com.example.marketplace.domain.message.MessageStatus;
import com.example.marketplace.domain.thread.ChatThread;
import com.example.marketplace.domain.thread.ThreadTargetType;
import com.example.marketplace.domain.user.User;
import com.example.marketplace.repository.ChatThreadRepository;
import com.example.marketplace.repository.MessageRepository;
import com.example.marketplace.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.time.Instant;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ChatControllerTest extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChatThreadRepository chatThreadRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Test
    void listMyThreads_and_markReadAndRevokeMessage_flow() throws Exception {
        var cookieA = authCookie("chat_user_a");
        var cookieB = authCookie("chat_user_b");

        User userA = userRepository.findByUsername("chat_user_a").orElseThrow();
        User userB = userRepository.findByUsername("chat_user_b").orElseThrow();

        // create thread via API as userA
        String body = """
                {
                  \"targetType\": \"system\",
                  \"recipientUserId\": %d,
                  \"content\": \"hello b\"
                }
                """.formatted(userB.getUserId());

        String response = mockMvc.perform(post("/api/threads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .cookie(cookieA))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Number threadIdNumber = com.jayway.jsonpath.JsonPath.read(response, "$.threadId");
        long threadId = threadIdNumber.longValue();

        // userA sends another message directly via repository for simplicity
        ChatThread thread = chatThreadRepository.findById(threadId).orElseThrow();
        Instant now = Instant.now();
        Message msg2 = new Message();
        msg2.setThreadId(thread.getThreadId());
        msg2.setSenderUserId(userA.getUserId());
        msg2.setRecipientUserId(userB.getUserId());
        msg2.setContent("second to b");
        msg2.setRead(false);
        msg2.setStatus(MessageStatus.active);
        msg2.setCreatedAt(now);
        msg2.setUpdatedAt(now);
        msg2 = messageRepository.save(msg2);

        // userB list my threads and see unreadCount > 0
        mockMvc.perform(get("/api/threads")
                        .param("page", "1")
                        .param("size", "20")
                        .cookie(cookieB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.threads[0].otherUserId").value(userA.getUserId()))
                .andExpect(jsonPath("$.threads[0].unreadCount").value(2));

        // userB mark thread as read-all
        mockMvc.perform(patch("/api/threads/{id}/read-all", threadId)
                        .cookie(cookieB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("ok"));

        // unreadCount becomes 0
        mockMvc.perform(get("/api/threads")
                        .param("page", "1")
                        .param("size", "20")
                        .cookie(cookieB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.threads[0].unreadCount").value(0));

        // sender revoke the second message within window
        mockMvc.perform(patch("/api/messages/{id}", msg2.getMessageId())
                        .param("action", "revoke")
                        .cookie(cookieA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("ok"));
    }
}
