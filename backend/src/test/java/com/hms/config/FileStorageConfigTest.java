package com.hms.config;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FileStorageConfigTest {

    @TempDir
    Path tempDir;

    private FileStorageConfig storageConfig() {
        FileStorageConfig config = new FileStorageConfig();
        ReflectionTestUtils.setField(config, "storagePath", tempDir.toString());
        return config;
    }

    @Test
    void store_validPdf_returnRelativePath() throws IOException {
        byte[] pdfContent = new byte[1024];
        MockMultipartFile file = new MockMultipartFile(
                "file", "report.pdf", "application/pdf", pdfContent);

        String path = storageConfig().store(file, "prescriptions");

        assertThat(path).startsWith("prescriptions/");
        assertThat(path).endsWith(".pdf");
    }

    @Test
    void store_fileExceedsMaxSize_throwsIllegalArgumentException() {
        byte[] bigContent = new byte[11 * 1024 * 1024]; // 11 MB
        MockMultipartFile file = new MockMultipartFile(
                "file", "big.pdf", "application/pdf", bigContent);

        assertThatThrownBy(() -> storageConfig().store(file, "prescriptions"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("10 MB");
    }

    @Test
    void store_nonPdfMime_throwsIllegalArgumentException() {
        byte[] content = new byte[512];
        MockMultipartFile file = new MockMultipartFile(
                "file", "image.png", "image/png", content);

        assertThatThrownBy(() -> storageConfig().store(file, "prescriptions"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("PDF");
    }

    @Test
    void store_createsSubdirectoryIfMissing() throws IOException {
        byte[] pdfContent = new byte[512];
        MockMultipartFile file = new MockMultipartFile(
                "file", "doc.pdf", "application/pdf", pdfContent);

        storageConfig().store(file, "new-subdir");

        assertThat(tempDir.resolve("new-subdir")).isDirectory();
    }
}
