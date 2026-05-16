import torch
import torch.nn as nn

class GatedResidualNetwork(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim, dropout=0.1):
        super().__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.elu = nn.ELU()
        self.fc2 = nn.Linear(hidden_dim, output_dim)
        self.dropout = nn.Dropout(dropout)
        self.gate = nn.Sequential(nn.Linear(output_dim, output_dim), nn.Sigmoid())
        self.norm = nn.LayerNorm(output_dim)
        
    def forward(self, x):
        residual = x
        x = self.fc1(x)
        x = self.elu(x)
        x = self.dropout(x)
        x = self.fc2(x)
        x = self.gate(x) * x
        x = self.norm(x + residual)
        return x

class CustomTFT(nn.Module):
    def __init__(self, seq_len=60, d_model=128, nhead=8, num_layers=3, ff_dim=256, dropout=0.1):
        super().__init__()
        self.embedding = nn.Linear(1, d_model)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model, nhead=nhead, dim_feedforward=ff_dim, dropout=dropout, batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        self.gated = GatedResidualNetwork(d_model, ff_dim, d_model)
        self.fc_out = nn.Linear(d_model, 1)
        
    def forward(self, x):
        x = self.embedding(x)
        x = self.transformer(x)
        x = self.gated(x)
        return self.fc_out(x[:, -1, :])
