class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.status = statusCode < 400;
        this.content = data;
    }
}

export { ApiResponse };
