package co.solarbell.app;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.NetworkRequest;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private ConnectivityManager redes;

    // La red de la campana no tiene internet: Android la deja de lado y manda el tráfico por
    // datos móviles, donde 192.168.4.1 no existe. Ligar la app al Wi-Fi la mantiene en esa red.
    private final ConnectivityManager.NetworkCallback alCambiarWifi =
        new ConnectivityManager.NetworkCallback() {
            @Override
            public void onAvailable(Network red) {
                redes.bindProcessToNetwork(red);
            }

            @Override
            public void onLost(Network red) {
                if (red.equals(redes.getBoundNetworkForProcess())) redes.bindProcessToNetwork(null);
            }
        };

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        redes = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkRequest wifi = new NetworkRequest.Builder()
            .addTransportType(NetworkCapabilities.TRANSPORT_WIFI)
            .removeCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build();
        redes.requestNetwork(wifi, alCambiarWifi);
    }

    @Override
    public void onDestroy() {
        redes.unregisterNetworkCallback(alCambiarWifi);
        redes.bindProcessToNetwork(null);
        super.onDestroy();
    }
}
