package flexio;

import org.teavm.interop.Address;
import org.teavm.interop.Export;

public class Client {
  private static int imageSize = 4096;
  private static byte[] buffer = new byte[4096];

  public static void main(String[] args) {
  }

  @Export(name = "ensureCapacity")
  public static void ensureCapacity(int newImageSize) {
    // runtime error when this function body isn't commendted
    // unreachable executed
    Client.imageSize = newImageSize;
    if (Client.buffer.length < newImageSize) {
      Client.buffer = new byte[newImageSize];
    }
  }

  @Export(name = "getBufferPointer")
  public static Address getBufferPointer() {
    return Address.ofData(Client.buffer);
  }

  @Export(name = "process")
  public static void process() {
    // this function seems to have no effect on the outcome
    for (int i = 0; i < Client.imageSize; ++i) {
      Client.buffer[i] += 1;
    }
  }
}
