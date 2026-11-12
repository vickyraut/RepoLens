package com.repolens.backend.services.ai;

import java.util.List;

import com.repolens.backend.dto.CitationDto;

public record RetrievedContext(
        List<CitationDto> citations,
        String contextText) {
}
