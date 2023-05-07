import time


class TimerError(Exception):
    """A custom exception used to report errors in use of Timer class"""


class Timer:
    def __init__(self):
        self._start_time = None

    def start(self):
        """Start a new timer"""
        if self._start_time is not None:
            raise TimerError(f"Timer is running. Use .stop() to stop it")

        self._start_time = time.perf_counter()

    def stop(self):
        """Stop the timer"""
        # if self._start_time is None:
        #     raise TimerError(f"Timer is not running. Use .start() to start it")

        # elapsed_time = time.perf_counter() - self._start_time

        self._start_time = None

        # print(f"Elapsed time: {elapsed_time:0.4f} seconds")

    def is_running(self):
        """ check if timer is running """

        if self._start_time is None:
            return False

        return True

    def is_timeout(self):

        if time.perf_counter() - self._start_time > 0.5:
            return True
        return False
        
