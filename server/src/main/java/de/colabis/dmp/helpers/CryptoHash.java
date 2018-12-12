package de.colabis.dmp.helpers;

import rx.Observable;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Simple helper class to calculate hash-codes for files
 * @author Ivo Senner <ivo.senner@igd.fraunhofer.de>
 */
public class CryptoHash {
  /**
   * Calculates the has of a given file using the provided MessageDigest object
   * @param digest MessageDigest object
   * @param file File to inspect
   * @return Hash-Code
   * @throws IOException
   */
  private static String getHash(MessageDigest digest, File file) throws IOException {
      FileInputStream fis = new FileInputStream(file);

      byte[] buffer = new byte[1024];
      int bc;

      while ((bc = fis.read(buffer)) != -1) {
        digest.update(buffer, 0, bc);
      }
      fis.close();
      byte[] bytes = digest.digest();

      // convert bytes from decimal to hexadecimal format
      StringBuilder sb = new StringBuilder();
      for (byte b : bytes) {
        sb.append(Integer.toString((b & 0xff) + 0x100, 16).substring(1));
      }

      return sb.toString();
  }


  /**
   * Get the sha1 hash of the given file
   * @param file File to inspect
   * @return Hash-Code
   * @throws IOException
   * @throws NoSuchAlgorithmException
   */
  public static String sha1(File file) throws IOException, NoSuchAlgorithmException {
    MessageDigest digest = MessageDigest.getInstance("SHA-1");
    return getHash(digest, file);
  }
}
