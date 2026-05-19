from __future__ import annotations

from typing import List, Optional

import requests
from langchain_core.embeddings import Embeddings


class NIMEmbeddings(Embeddings):
    """NVIDIA NIM embeddings wrapper that sends a single string per request.

    NIM's embeddings endpoint expects a string input; sending a list can raise
    server-side errors. This wrapper keeps requests compatible.
    """

    def __init__(
        self,
        api_key: str,
        base_url: str,
        model: str,
        query_input_type: str = "query",
        doc_input_type: str = "passage",
        timeout: Optional[float] = None,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.model = model
        self.query_input_type = query_input_type
        self.doc_input_type = doc_input_type
        self.timeout = timeout or 30

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self._embed_one(text, self.doc_input_type) for text in texts]

    def embed_query(self, text: str) -> List[float]:
        return self._embed_one(text, self.query_input_type)

    def _embed_one(self, text: str, input_type: str) -> List[float]:
        response = requests.post(
            f"{self.base_url}/embeddings",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": self.model,
                "input": text,
                "input_type": input_type,
            },
            timeout=self.timeout,
        )
        response.raise_for_status()
        data = response.json()
        return data["data"][0]["embedding"]
