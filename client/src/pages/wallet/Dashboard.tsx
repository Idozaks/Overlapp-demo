import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Wallet, NFT, Transaction } from "@shared/schema";

export default function WalletDashboard() {
  const { toast } = useToast();
  const userId = 1; // TODO: Get from auth context when available

  const { data: walletData, isLoading: loadingWallet } = useQuery<{ wallet: Wallet }>({
    queryKey: [`/api/wallet?userId=${userId}`],
    retry: false
  });

  const { data: nftsData, isLoading: loadingNFTs } = useQuery<{ nfts: NFT[] }>({
    queryKey: [`/api/wallet/nfts?userId=${userId}`],
    retry: false
  });

  const { data: transactionsData, isLoading: loadingTransactions } = useQuery<{ transactions: Transaction[] }>({
    queryKey: [`/api/wallet/transactions?walletId=${walletData?.wallet?.id}`],
    enabled: !!walletData?.wallet?.id,
    retry: false
  });

  // Show loading state
  if (loadingWallet || loadingNFTs || (walletData?.wallet?.id && loadingTransactions)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Handle error states
  if (!walletData?.wallet) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Error loading wallet information</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Wallet Balance Card */}
          <Card>
            <CardHeader>
              <CardTitle>Wallet Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{walletData.wallet.balance || "0"}</p>
              <div className="mt-4 flex gap-2">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Funds
                </Button>
                <Button variant="outline">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  Transfer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* NFT Collection */}
          <Card>
            <CardHeader>
              <CardTitle>My NFTs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nftsData?.nfts?.map((nft: NFT) => (
                  <Card key={nft.id}>
                    <CardContent className="p-4">
                      {nft.metadata?.image && (
                        <img 
                          src={nft.metadata.image} 
                          alt={nft.title}
                          className="w-full h-48 object-cover rounded-lg mb-2"
                        />
                      )}
                      <h3 className="font-semibold">{nft.title}</h3>
                      <p className="text-sm text-muted-foreground">{nft.description}</p>
                    </CardContent>
                  </Card>
                ))}
                {(!nftsData?.nfts || nftsData.nfts.length === 0) && (
                  <p className="text-muted-foreground col-span-full text-center py-4">No NFTs found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactionsData?.transactions?.map((tx: Transaction) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{tx.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <p className={`font-mono ${tx.amount?.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>
                      {tx.amount || '0'}
                    </p>
                  </div>
                ))}
                {(!transactionsData?.transactions || transactionsData.transactions.length === 0) && (
                  <p className="text-muted-foreground text-center py-4">No transactions yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}