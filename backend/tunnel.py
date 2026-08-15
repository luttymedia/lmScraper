"""SSH Tunnel Manager for LMScraper Mobile Access."""
import asyncio
import re
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("lmscraper.tunnel")

class TunnelManager:
    def __init__(self):
        self._process: Optional[asyncio.subprocess.Process] = None
        self._url: Optional[str] = None
        self._status: str = "stopped"  # "stopped", "starting", "active", "error"
        self._error: Optional[str] = None
        self._task: Optional[asyncio.Task] = None

    @property
    def status_dict(self) -> Dict[str, Any]:
        return {
            "active": self._status == "active",
            "status": self._status,
            "url": self._url,
            "error": self._error
        }

    async def start(self) -> Dict[str, Any]:
        if self._process and self._process.returncode is None:
            if self._status == "active" and self._url:
                return self.status_dict
            if self._status == "starting":
                return self.status_dict

        self._status = "starting"
        self._url = None
        self._error = None

        cmd = [
            "ssh",
            "-o", "StrictHostKeyChecking=no",
            "-T",
            "-R", "80:127.0.0.1:8000",
            "nokey@localhost.run"
        ]

        try:
            self._process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT
            )
            self._task = asyncio.create_task(self._read_output())
        except Exception as e:
            self._status = "error"
            self._error = f"Failed to launch SSH tunnel process: {str(e)}"
            logger.error(self._error)
            return self.status_dict

        # Wait up to 10 seconds for URL to be detected
        for _ in range(20):
            await asyncio.sleep(0.5)
            if self._status in ("active", "error"):
                break
        
        if self._status == "starting":
            # Still starting after 10 seconds
            if not self._url:
                self._error = "Tunnel starting is taking longer than expected. Check connection."
                
        return self.status_dict

    async def _read_output(self):
        if not self._process or not self._process.stdout:
            return

        url_regex = re.compile(r"https://[a-zA-Z0-9-]+\.lhr\.life")
        try:
            while True:
                line_bytes = await self._process.stdout.readline()
                if not line_bytes:
                    break
                line = line_bytes.decode("utf-8", errors="ignore").strip()
                if not line:
                    continue
                logger.debug(f"[Tunnel Output] {line}")
                
                match = url_regex.search(line)
                if match:
                    self._url = match.group(0)
                    self._status = "active"
                    self._error = None
                    logger.info(f"Mobile tunnel active: {self._url}")
                elif "connection refused" in line.lower() or "permission denied" in line.lower():
                    if not self._url:
                        self._status = "error"
                        self._error = line
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.error(f"Error reading tunnel output: {e}")
        finally:
            if self._status != "error":
                self._status = "stopped"
                self._url = None

    async def stop(self) -> Dict[str, Any]:
        if self._process and self._process.returncode is None:
            try:
                self._process.terminate()
                await asyncio.sleep(0.3)
                if self._process.returncode is None:
                    self._process.kill()
            except Exception as e:
                logger.warning(f"Error stopping tunnel: {e}")
        if self._task and not self._task.done():
            self._task.cancel()
        
        self._process = None
        self._task = None
        self._status = "stopped"
        self._url = None
        self._error = None
        return self.status_dict

tunnel_manager = TunnelManager()
