package com.hms.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Configuration
public class FileStorageConfig {

    @Value("${hms.file.storage-path}")
    private String storagePath;

    private static final long MAX_SIZE = 10L * 1024 * 1024; // 10 MB
    private static final String ALLOWED_MIME = "application/pdf";

    public String store(MultipartFile file, String subdir) throws IOException {
        if (file.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException("File exceeds maximum size of 10 MB");
        }
        String contentType = file.getContentType();
        if (!ALLOWED_MIME.equalsIgnoreCase(contentType)) {
            throw new IllegalArgumentException("Only PDF files are accepted");
        }

        Path dir = Paths.get(storagePath, subdir);
        Files.createDirectories(dir);

        String filename = UUID.randomUUID() + ".pdf";
        Path target = dir.resolve(filename);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        return subdir + "/" + filename;
    }

    public Path load(String relativePath) {
        return Paths.get(storagePath).resolve(relativePath).normalize();
    }
}
