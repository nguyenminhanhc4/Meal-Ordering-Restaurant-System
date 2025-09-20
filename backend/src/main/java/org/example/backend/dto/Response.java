package org.example.backend.dto;

import lombok.Data;

@Data
public class Response<T> {
    private final String status;
    private final T data;
    private final String message;

    public Response(String status, T data, String message) {
        this.status = status;
        this.data = data;
        this.message = message;
    }

    public String getStatus() { return status; }
    public T getData() { return data; }
    public String getMessage() { return message; }
}
